import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'groups_repository.dart';

final groupsRepositoryProvider = Provider<GroupsRepository>((ref) {
  return GroupsRepository(ref.watch(dioProvider));
});
