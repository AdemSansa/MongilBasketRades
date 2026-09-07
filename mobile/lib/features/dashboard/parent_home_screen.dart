import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../auth/auth_controller.dart';
import '../players/add_child_screen.dart';
import '../players/player.dart';
import '../players/players_controller.dart';

class ParentHomeScreen extends ConsumerWidget {
  const ParentHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final childrenState = ref.watch(myChildrenControllerProvider);

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
        onRefresh: () => ref.read(myChildrenControllerProvider.notifier).refresh(),
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
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              itemCount: children.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) => _ChildCard(child: children[index]),
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

class _ChildCard extends StatelessWidget {
  const _ChildCard({required this.child});

  final Player child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.person)),
        title: Text(child.fullName),
        subtitle: Text('${child.age} years old'),
        trailing: child.status == 'ARCHIVED'
            ? const Chip(label: Text('Archived'))
            : null,
      ),
    );
  }
}
