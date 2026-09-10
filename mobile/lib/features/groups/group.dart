class Group {
  const Group({
    required this.id,
    required this.name,
    required this.seasonId,
    required this.ageMin,
    required this.ageMax,
    required this.capacity,
    required this.currentCount,
    required this.status,
    this.coachName,
  });

  factory Group.fromJson(Map<String, dynamic> json) => Group(
        id: json['id'] as String,
        name: json['name'] as String,
        seasonId: json['seasonId'] as String,
        ageMin: json['ageMin'] as int,
        ageMax: json['ageMax'] as int,
        capacity: json['capacity'] as int,
        currentCount: json['currentCount'] as int,
        coachName: json['coachName'] as String?,
        status: json['status'] as String,
      );

  final String id;
  final String name;
  final String seasonId;
  final int ageMin;
  final int ageMax;
  final int capacity;
  final int currentCount;
  final String? coachName;
  final String status;

  bool get isFull => currentCount >= capacity;
}
