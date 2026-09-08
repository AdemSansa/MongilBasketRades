import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../groups/group.dart';
import '../groups/groups_providers.dart';
import '../players/player.dart';
import 'registrations_controller.dart';

class RegisterChildScreen extends ConsumerStatefulWidget {
  const RegisterChildScreen({super.key, required this.player});

  final Player player;

  @override
  ConsumerState<RegisterChildScreen> createState() => _RegisterChildScreenState();
}

class _RegisterChildScreenState extends ConsumerState<RegisterChildScreen> {
  late Future<_GroupOptions> _future;
  String? _submittingGroupId;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_GroupOptions> _load() async {
    final repo = ref.read(groupsRepositoryProvider);
    final season = await repo.activeSeason();
    if (season == null) {
      return const _GroupOptions(seasonName: null, groups: []);
    }
    final groups = await repo.groupsForSeason(season.id);
    return _GroupOptions(seasonName: season.name, groups: groups);
  }

  Future<void> _submit(Group group) async {
    setState(() => _submittingGroupId = group.id);
    try {
      await ref
          .read(myRegistrationsControllerProvider.notifier)
          .submit(playerId: widget.player.id, groupId: group.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration submitted for ${widget.player.fullName}')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _submittingGroupId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Register ${widget.player.fullName}')),
      body: FutureBuilder<_GroupOptions>(
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

          final options = snapshot.data!;
          if (options.seasonName == null) {
            return const ErrorView(message: 'No active season is open for registration right now.');
          }
          if (options.groups.isEmpty) {
            return ErrorView(message: 'No groups are available for the ${options.seasonName} season yet.');
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: options.groups.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final group = options.groups[index];
              final isSubmitting = _submittingGroupId == group.id;
              return Card(
                child: ListTile(
                  title: Text(group.name),
                  subtitle: Text(
                    '${group.scheduleLabel}\nAges ${group.ageMin}-${group.ageMax} · ${group.currentCount}/${group.capacity} spots'
                    '${group.coachName != null ? ' · Coach ${group.coachName}' : ''}',
                  ),
                  isThreeLine: true,
                  trailing: isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : FilledButton(
                          onPressed: () => _submit(group),
                          child: Text(group.isFull ? 'Join waitlist' : 'Register'),
                        ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _GroupOptions {
  const _GroupOptions({required this.seasonName, required this.groups});

  final String? seasonName;
  final List<Group> groups;
}
