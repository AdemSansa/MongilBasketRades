import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import 'sessions_controller.dart';
import 'training_session.dart';

class SessionDetailScreen extends ConsumerStatefulWidget {
  const SessionDetailScreen({super.key, required this.sessionId});

  final String sessionId;

  @override
  ConsumerState<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends ConsumerState<SessionDetailScreen> {
  late Future<TrainingSessionDetail> _future;
  bool _isActing = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<TrainingSessionDetail> _load() {
    return ref.read(sessionsRepositoryProvider).getDetail(widget.sessionId);
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
      if (mounted) setState(() => _future = _load());
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isActing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Session')),
      body: FutureBuilder<TrainingSessionDetail>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: snapshot.error.toString(),
              onRetry: () => setState(() => _future = _load()),
            );
          }

          final session = snapshot.data!;
          final isScheduled = session.status == 'SCHEDULED';

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
                child: Text('Roster (${session.roster.length})', style: Theme.of(context).textTheme.titleMedium),
              ),
              Expanded(
                child: session.roster.isEmpty
                    ? const Center(child: Text('No players currently assigned to this group.'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: session.roster.length,
                        itemBuilder: (context, index) {
                          final player = session.roster[index];
                          return ListTile(
                            leading: const Icon(Icons.person_outline),
                            title: Text(player.fullName),
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
