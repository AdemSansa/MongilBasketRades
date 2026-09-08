import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../auth/auth_controller.dart';
import '../players/add_child_screen.dart';
import '../players/player.dart';
import '../players/players_controller.dart';
import '../registrations/register_child_screen.dart';
import '../registrations/registration.dart';
import '../registrations/registrations_controller.dart';

class ParentHomeScreen extends ConsumerWidget {
  const ParentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final childrenState = ref.watch(myChildrenControllerProvider);
    final registrationsState = ref.watch(myRegistrationsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Children'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const AddChildScreen()),
        ),
        icon: const Icon(Icons.add),
        label: const Text('Add Child'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(myChildrenControllerProvider.notifier).refresh();
          await ref.read(myRegistrationsControllerProvider.notifier).refresh();
        },
        child: childrenState.when(
          loading: () => const LoadingView(),
          error: (error, _) => ErrorView(
            message: error.toString(),
            onRetry: () => ref.read(myChildrenControllerProvider.notifier).refresh(),
          ),
          data: (children) {
            if (children.isEmpty) {
              return LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: _EmptyState(userName: user?.firstName ?? 'there'),
                  ),
                ),
              );
            }

            final registrations = registrationsState.valueOrNull ?? const <Registration>[];

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              itemCount: children.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final child = children[index];
                Registration? registration;
                for (final r in registrations) {
                  if (r.playerId == child.id && r.isActive) {
                    registration = r;
                    break;
                  }
                }
                return _ChildCard(child: child, registration: registration);
              },
            );
          },
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.userName});

  final String userName;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.sports_basketball, size: 48),
            const SizedBox(height: 12),
            Text(
              'Welcome, $userName!',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Add your first child to get started.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ChildCard extends ConsumerWidget {
  const _ChildCard({required this.child, required this.registration});

  final Player child;
  final Registration? registration;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isArchived = child.status == 'ARCHIVED';

    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: Text(child.fullName),
            subtitle: Text(
              registration != null
                  ? '${child.age} years old · ${registration!.requestedGroupName} — ${registration!.statusLabel}'
                  : '${child.age} years old',
            ),
            trailing: isArchived ? const Chip(label: Text('Archived')) : null,
          ),
          if (!isArchived && registration == null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => RegisterChildScreen(player: child)),
                  ),
                  child: const Text('Register'),
                ),
              ),
            ),
          if (!isArchived && registration != null && registration!.isPending)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () =>
                      ref.read(myRegistrationsControllerProvider.notifier).cancel(registration!.id),
                  child: const Text('Cancel registration'),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
