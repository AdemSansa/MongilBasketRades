class RosterMark {
  const RosterMark({
    required this.playerId,
    required this.playerName,
    required this.status,
    required this.attendanceId,
  });

  factory RosterMark.fromJson(Map<String, dynamic> json) => RosterMark(
        playerId: json['playerId'] as String,
        playerName: json['playerName'] as String,
        status: json['status'] as String?,
        attendanceId: json['attendanceId'] as String?,
      );

  final String playerId;
  final String playerName;
  final String? status;
  final String? attendanceId;

  RosterMark copyWith({String? status, String? attendanceId}) => RosterMark(
        playerId: playerId,
        playerName: playerName,
        status: status ?? this.status,
        attendanceId: attendanceId ?? this.attendanceId,
      );
}

class SessionAttendance {
  const SessionAttendance({required this.sessionId, required this.roster});

  factory SessionAttendance.fromJson(Map<String, dynamic> json) => SessionAttendance(
        sessionId: json['sessionId'] as String,
        roster: (json['roster'] as List<dynamic>)
            .map((e) => RosterMark.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  final String sessionId;
  final List<RosterMark> roster;
}

class PlayerAttendanceSummary {
  const PlayerAttendanceSummary({
    required this.totalSessions,
    required this.present,
    required this.absent,
    required this.late,
    required this.excused,
    required this.attendanceRate,
  });

  factory PlayerAttendanceSummary.fromJson(Map<String, dynamic> json) => PlayerAttendanceSummary(
        totalSessions: json['totalSessions'] as int,
        present: json['present'] as int,
        absent: json['absent'] as int,
        late: json['late'] as int,
        excused: json['excused'] as int,
        attendanceRate: (json['attendanceRate'] as num).toDouble(),
      );

  final int totalSessions;
  final int present;
  final int absent;
  final int late;
  final int excused;
  final double attendanceRate;
}
