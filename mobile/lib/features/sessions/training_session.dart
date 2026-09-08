class TrainingSession {
  const TrainingSession({
    required this.id,
    required this.groupId,
    required this.groupName,
    required this.coachId,
    required this.coachName,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.location,
    this.notes,
  });

  factory TrainingSession.fromJson(Map<String, dynamic> json) => TrainingSession(
        id: json['id'] as String,
        groupId: json['groupId'] as String,
        groupName: json['groupName'] as String,
        coachId: json['coachId'] as String,
        coachName: json['coachName'] as String,
        date: DateTime.parse(json['date'] as String),
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
        location: json['location'] as String?,
        status: json['status'] as String,
        notes: json['notes'] as String?,
      );

  final String id;
  final String groupId;
  final String groupName;
  final String coachId;
  final String coachName;
  final DateTime date;
  final String startTime;
  final String endTime;
  final String? location;
  final String status;
  final String? notes;

  String get timeRangeLabel => '${startTime.substring(0, 5)}–${endTime.substring(0, 5)}';
}

class RosterPlayer {
  const RosterPlayer({required this.id, required this.firstName, required this.lastName});

  factory RosterPlayer.fromJson(Map<String, dynamic> json) => RosterPlayer(
        id: json['id'] as String,
        firstName: json['firstName'] as String,
        lastName: json['lastName'] as String,
      );

  final String id;
  final String firstName;
  final String lastName;

  String get fullName => '$firstName $lastName';
}

class TrainingSessionDetail extends TrainingSession {
  const TrainingSessionDetail({
    required super.id,
    required super.groupId,
    required super.groupName,
    required super.coachId,
    required super.coachName,
    required super.date,
    required super.startTime,
    required super.endTime,
    required super.status,
    required this.roster,
    super.location,
    super.notes,
  });

  factory TrainingSessionDetail.fromJson(Map<String, dynamic> json) => TrainingSessionDetail(
        id: json['id'] as String,
        groupId: json['groupId'] as String,
        groupName: json['groupName'] as String,
        coachId: json['coachId'] as String,
        coachName: json['coachName'] as String,
        date: DateTime.parse(json['date'] as String),
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
        location: json['location'] as String?,
        status: json['status'] as String,
        notes: json['notes'] as String?,
        roster: (json['roster'] as List<dynamic>)
            .map((e) => RosterPlayer.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  final List<RosterPlayer> roster;
}
