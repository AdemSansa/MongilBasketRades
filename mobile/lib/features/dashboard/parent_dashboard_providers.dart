import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'parent_dashboard.dart';
import 'parent_dashboard_repository.dart';

final parentDashboardRepositoryProvider = Provider<ParentDashboardRepository>((ref) {
  return ParentDashboardRepository(ref.watch(dioProvider));
});

final parentDashboardProvider = FutureProvider<List<ChildDashboardSummary>>((ref) {
  return ref.watch(parentDashboardRepositoryProvider).get();
});
