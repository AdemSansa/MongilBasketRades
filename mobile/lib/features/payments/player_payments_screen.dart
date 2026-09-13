import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/error_view.dart';
import '../../shared/widgets/loading_view.dart';
import '../players/player.dart';
import 'payment.dart';
import 'payments_providers.dart';

const _statusColors = <String, Color>{
  'PAID': Colors.green,
  'UNPAID': Colors.blueGrey,
  'OVERDUE': Colors.red,
};

class PlayerPaymentsScreen extends ConsumerWidget {
  const PlayerPaymentsScreen({super.key, required this.player});

  final Player player;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsState = ref.watch(playerPaymentsProvider(player.id));

    return Scaffold(
      appBar: AppBar(title: Text('${player.fullName} — Payments')),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(playerPaymentsProvider(player.id).future),
        child: paymentsState.when(
          loading: () => const LoadingView(),
          error: (error, _) => ErrorView(
            message: error.toString(),
            onRetry: () => ref.invalidate(playerPaymentsProvider(player.id)),
          ),
          data: (payments) {
            if (payments.isEmpty) {
              return LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: const Center(child: Text('No payment records yet.')),
                  ),
                ),
              );
            }

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: payments.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) => _PaymentCard(payment: payments[index]),
            );
          },
        ),
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  const _PaymentCard({required this.payment});

  final Payment payment;

  @override
  Widget build(BuildContext context) {
    final color = _statusColors[payment.status] ?? Colors.grey;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(payment.periodLabel, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text('${payment.amount.toStringAsFixed(2)} ${payment.currency}'),
                  if (payment.paymentDate != null)
                    Text(
                      'Paid on ${payment.paymentDate!.year}-${payment.paymentDate!.month.toString().padLeft(2, '0')}-${payment.paymentDate!.day.toString().padLeft(2, '0')}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
            ),
            Chip(
              label: Text(payment.status),
              backgroundColor: color.withValues(alpha: 0.15),
              labelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
