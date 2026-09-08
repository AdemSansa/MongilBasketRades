import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../auth/auth_controller.dart';
import '../sessions/session_detail_screen.dart';
import '../sessions/sessions_controller.dart';
import '../sessions/training_session.dart';

class CoachDashboardScreen extends ConsumerWidget {
  const CoachDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final sessionsState = ref.watch(todaySessionsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Today'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(todaySessionsControllerProvider.notifier).refresh(),
        child: sessionsState.when(
          loading: () => const LoadingView(),
          error: (error, _) => ErrorView(
            message: error.toString(),
            onRetry: () => ref.read(todaySessionsControllerProvider.notifier).refresh(),
          ),
          data: (sessions) {
            if (sessions.isEmpty) {
              return LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.sports_basketball, size: 48),
                            const SizedBox(height: 12),
                            Text(
                              'Welcome, ${user?.firstName ?? 'Coach'}.',
                              style: Theme.of(context).textTheme.titleMedium,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            const Text('No sessions scheduled for you today.', textAlign: TextAlign.center),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: sessions.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) => _SessionCard(session: sessions[index]),
            );
          },
        ),
      ),
    );
  }
}

class _SessionCard extends StatelessWidget {
  const _SessionCard({required this.session});

  final TrainingSession session;

  @override
  Widget build(BuildContext context) {
    final isScheduled = session.status == 'SCHEDULED';

    return Card(
      child: ListTile(
        leading: const Icon(Icons.schedule),
        title: Text(session.groupName),
        subtitle: Text(
          '${session.timeRangeLabel}${session.location != null ? ' · ${session.location}' : ''}',
        ),
        trailing: isScheduled
            ? FilledButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => SessionDetailScreen(sessionId: session.id)),
                ),
                child: const Text('Roster'),
              )
            : Chip(label: Text(session.status)),
      ),
    );
  }
}
