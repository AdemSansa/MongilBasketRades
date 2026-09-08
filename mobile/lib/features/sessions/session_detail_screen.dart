import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../attendance/attendance_mark.dart';
import '../attendance/attendance_providers.dart';
import 'sessions_controller.dart';
import 'training_session.dart';

class _SessionDetailData {
  const _SessionDetailData({required this.session, required this.attendance});

  final TrainingSessionDetail session;
  final SessionAttendance attendance;
}

const _statusOptions = <String, ({String label, IconData icon, Color color})>{
  'PRESENT': (label: 'Present', icon: Icons.check_circle, color: Colors.green),
  'ABSENT': (label: 'Absent', icon: Icons.cancel, color: Colors.red),
  'LATE': (label: 'Late', icon: Icons.schedule, color: Colors.orange),
  'EXCUSED': (label: 'Excused', icon: Icons.event_busy, color: Colors.blueGrey),
};

class SessionDetailScreen extends ConsumerStatefulWidget {
  const SessionDetailScreen({super.key, required this.sessionId});

  final String sessionId;

  @override
  ConsumerState<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends ConsumerState<SessionDetailScreen> {
  late Future<_SessionDetailData> _future;
  bool _isActing = false;
  Map<String, String?> _statusByPlayerId = {};

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_SessionDetailData> _load() async {
    final results = await Future.wait([
      ref.read(sessionsRepositoryProvider).getDetail(widget.sessionId),
      ref.read(attendanceRepositoryProvider).getForSession(widget.sessionId),
    ]);
    final session = results[0] as TrainingSessionDetail;
    final attendance = results[1] as SessionAttendance;
    _statusByPlayerId = {for (final mark in attendance.roster) mark.playerId: mark.status};
    return _SessionDetailData(session: session, attendance: attendance);
  }

  Future<void> _cancelSession() async {
    setState(() => _isActing = true);
    try {
      await ref.read(sessionsRepositoryProvider).cancel(widget.sessionId);
      await ref.read(todaySessionsControllerProvider.notifier).refresh();
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isActing = false);
    }
  }

  Future<void> _completeSession() async {
    setState(() => _isActing = true);
    try {
      await ref.read(sessionsRepositoryProvider).complete(widget.sessionId);
      await ref.read(todaySessionsControllerProvider.notifier).refresh();
      if (mounted) {
        setState(() {
          _future = _load();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isActing = false);
    }
  }

  Future<void> _markPlayer(String playerId, String status) async {
    final previous = _statusByPlayerId[playerId];
    setState(() => _statusByPlayerId[playerId] = status);
    try {
      await ref.read(attendanceRepositoryProvider).mark(widget.sessionId, playerId, status);
    } catch (e) {
      if (mounted) {
        setState(() => _statusByPlayerId[playerId] = previous);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _markAllPresent(List<RosterMark> roster) async {
    final unmarked = roster.where((m) => _statusByPlayerId[m.playerId] == null).map((m) => m.playerId).toList();
    if (unmarked.isEmpty) return;
    setState(() {
      for (final id in unmarked) {
        _statusByPlayerId[id] = 'PRESENT';
      }
    });
    try {
      await ref.read(attendanceRepositoryProvider).markAll(widget.sessionId, unmarked, 'PRESENT');
    } catch (e) {
      if (mounted) {
        setState(() {
          for (final id in unmarked) {
            _statusByPlayerId[id] = null;
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Session')),
      body: FutureBuilder<_SessionDetailData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: snapshot.error.toString(),
              onRetry: () => setState(() {
                _future = _load();
              }),
            );
          }

          final session = snapshot.data!.session;
          final roster = snapshot.data!.attendance.roster;
          final isScheduled = session.status == 'SCHEDULED';
          final markedCount = roster.where((m) => _statusByPlayerId[m.playerId] != null).length;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(session.groupName, style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 4),
                        Text(
                          '${session.date.year}-${session.date.month.toString().padLeft(2, '0')}-${session.date.day.toString().padLeft(2, '0')} · ${session.timeRangeLabel}',
                        ),
                        if (session.location != null) Text(session.location!),
                        const SizedBox(height: 8),
                        Chip(label: Text(session.status)),
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Attendance ($markedCount/${roster.length} marked)',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    if (roster.isNotEmpty)
                      TextButton.icon(
                        onPressed: () => _markAllPresent(roster),
                        icon: const Icon(Icons.done_all),
                        label: const Text('All present'),
                      ),
                  ],
                ),
              ),
              Expanded(
                child: roster.isEmpty
                    ? const Center(child: Text('No players currently assigned to this group.'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: roster.length,
                        itemBuilder: (context, index) {
                          final mark = roster[index];
                          final current = _statusByPlayerId[mark.playerId];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(mark.playerName, style: Theme.of(context).textTheme.bodyLarge),
                                  ),
                                  ..._statusOptions.entries.map((entry) {
                                    final selected = current == entry.key;
                                    return Padding(
                                      padding: const EdgeInsets.only(left: 4),
                                      child: InkWell(
                                        borderRadius: BorderRadius.circular(20),
                                        onTap: () => _markPlayer(mark.playerId, entry.key),
                                        child: CircleAvatar(
                                          radius: 18,
                                          backgroundColor: selected
                                              ? entry.value.color
                                              : entry.value.color.withValues(alpha: 0.12),
                                          child: Icon(
                                            entry.value.icon,
                                            size: 18,
                                            color: selected ? Colors.white : entry.value.color,
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              if (isScheduled)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isActing ? null : _cancelSession,
                          child: const Text('Cancel session'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton(
                          onPressed: _isActing ? null : _completeSession,
                          child: const Text('Mark completed'),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
