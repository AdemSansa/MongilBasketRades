import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'player.dart';
import 'players_repository.dart';

final playersRepositoryProvider = Provider<PlayersRepository>((ref) {
  return PlayersRepository(ref.watch(dioProvider));
});

class MyChildrenController extends AsyncNotifier<List<Player>> {
  @override
  Future<List<Player>> build() => ref.read(playersRepositoryProvider).myChildren();

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(playersRepositoryProvider).myChildren());
  }

  Future<void> addChild({
    required String firstName,
    required String lastName,
    required DateTime dateOfBirth,
    String? gender,
    String? emergencyContactName,
    String? emergencyContactPhone,
  }) async {
    await ref.read(playersRepositoryProvider).createChild(
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: dateOfBirth,
          gender: gender,
          emergencyContactName: emergencyContactName,
          emergencyContactPhone: emergencyContactPhone,
        );
    await refresh();
  }
}

final myChildrenControllerProvider = AsyncNotifierProvider<MyChildrenController, List<Player>>(
  MyChildrenController.new,
);
