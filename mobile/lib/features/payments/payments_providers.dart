import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'payment.dart';
import 'payments_repository.dart';

final paymentsRepositoryProvider = Provider<PaymentsRepository>((ref) {
  return PaymentsRepository(ref.watch(dioProvider));
});

final playerPaymentsProvider = FutureProvider.family<List<Payment>, String>((ref, playerId) {
  return ref.watch(paymentsRepositoryProvider).forPlayer(playerId);
});
