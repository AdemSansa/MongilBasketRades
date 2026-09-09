class ChildDashboardSummary {
  const ChildDashboardSummary({
    required this.playerId,
    required this.playerName,
    this.groupName,
    this.nextTrainingDate,
    this.nextTrainingTime,
    this.attendanceRate,
    this.paymentStatus,
  });

  factory ChildDashboardSummary.fromJson(Map<String, dynamic> json) => ChildDashboardSummary(
        playerId: json['playerId'] as String,
        playerName: json['playerName'] as String,
        groupName: json['groupName'] as String?,
        nextTrainingDate:
            json['nextTrainingDate'] != null ? DateTime.parse(json['nextTrainingDate'] as String) : null,
        nextTrainingTime: json['nextTrainingTime'] as String?,
        attendanceRate: json['attendanceRate'] != null ? (json['attendanceRate'] as num).toDouble() : null,
        paymentStatus: json['paymentStatus'] as String?,
      );

  final String playerId;
  final String playerName;
  final String? groupName;
  final DateTime? nextTrainingDate;
  final String? nextTrainingTime;
  final double? attendanceRate;
  final String? paymentStatus;

  /// "2026-09-13" + "09:00:00" -> "Sep 13, 09:00"
  String? get nextTrainingLabel {
    if (nextTrainingDate == null || nextTrainingTime == null) return null;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final month = months[nextTrainingDate!.month - 1];
    return '$month ${nextTrainingDate!.day}, ${nextTrainingTime!.substring(0, 5)}';
  }
}
