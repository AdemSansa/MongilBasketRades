import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'sessions_repository.dart';
import 'training_session.dart';

final sessionsRepositoryProvider = Provider<SessionsRepository>((ref) {
  return SessionsRepository(ref.watch(dioProvider));
});

class TodaySessionsController extends AsyncNotifier<List<TrainingSession>> {
  @override
  Future<List<TrainingSession>> build() => ref.read(sessionsRepositoryProvider).today();

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(sessionsRepositoryProvider).today());
  }
}

final todaySessionsControllerProvider =
    AsyncNotifierProvider<TodaySessionsController, List<TrainingSession>>(TodaySessionsController.new);
