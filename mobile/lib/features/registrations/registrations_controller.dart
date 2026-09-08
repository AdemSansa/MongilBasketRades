import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'registration.dart';
import 'registrations_repository.dart';

final registrationsRepositoryProvider = Provider<RegistrationsRepository>((ref) {
  return RegistrationsRepository(ref.watch(dioProvider));
});

class MyRegistrationsController extends AsyncNotifier<List<Registration>> {
  @override
  Future<List<Registration>> build() => ref.read(registrationsRepositoryProvider).myRegistrations();

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(registrationsRepositoryProvider).myRegistrations());
  }

  Future<void> submit({required String playerId, required String groupId}) async {
    await ref.read(registrationsRepositoryProvider).submit(playerId: playerId, groupId: groupId);
    await refresh();
  }

  Future<void> cancel(String registrationId) async {
    await ref.read(registrationsRepositoryProvider).cancel(registrationId);
    await refresh();
  }
}

final myRegistrationsControllerProvider =
    AsyncNotifierProvider<MyRegistrationsController, List<Registration>>(MyRegistrationsController.new);
