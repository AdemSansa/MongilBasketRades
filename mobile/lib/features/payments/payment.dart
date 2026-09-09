class Payment {
  const Payment({
    required this.id,
    required this.playerId,
    required this.playerName,
    required this.amount,
    required this.currency,
    required this.period,
    required this.status,
    this.paymentDate,
    this.method,
    this.reference,
    this.notes,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
        id: json['id'] as String,
        playerId: json['playerId'] as String,
        playerName: json['playerName'] as String,
        amount: (json['amount'] as num).toDouble(),
        currency: json['currency'] as String,
        period: json['period'] as String,
        paymentDate: json['paymentDate'] != null ? DateTime.parse(json['paymentDate'] as String) : null,
        method: json['method'] as String?,
        status: json['status'] as String,
        reference: json['reference'] as String?,
        notes: json['notes'] as String?,
      );

  final String id;
  final String playerId;
  final String playerName;
  final double amount;
  final String currency;
  final String period;
  final DateTime? paymentDate;
  final String? method;
  final String status;
  final String? reference;
  final String? notes;

  /// "2026-09" -> "September 2026"
  String get periodLabel {
    final parts = period.split('-');
    if (parts.length != 2) return period;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    final monthIndex = int.tryParse(parts[1]);
    if (monthIndex == null || monthIndex < 1 || monthIndex > 12) return period;
    return '${months[monthIndex - 1]} ${parts[0]}';
  }
}
