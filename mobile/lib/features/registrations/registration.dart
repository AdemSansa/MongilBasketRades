class Registration {
  const Registration({
    required this.id,
    required this.playerId,
    required this.playerName,
    required this.requestedGroupId,
    required this.requestedGroupName,
    required this.status,
    this.notes,
  });

  factory Registration.fromJson(Map<String, dynamic> json) => Registration(
        id: json['id'] as String,
        playerId: json['playerId'] as String,
        playerName: json['playerName'] as String,
        requestedGroupId: json['requestedGroupId'] as String,
        requestedGroupName: json['requestedGroupName'] as String,
        status: json['status'] as String,
        notes: json['notes'] as String?,
      );

  final String id;
  final String playerId;
  final String playerName;
  final String requestedGroupId;
  final String requestedGroupName;
  final String status;
  final String? notes;

  bool get isActive => status == 'PENDING' || status == 'APPROVED' || status == 'WAITING_LIST';
  bool get isPending => status == 'PENDING';

  String get statusLabel => switch (status) {
        'PENDING' => 'Pending review',
        'APPROVED' => 'Approved',
        'REJECTED' => 'Rejected',
        'WAITING_LIST' => 'Waiting list',
        'CANCELLED' => 'Cancelled',
        _ => status,
      };
}
