class Player {
  const Player({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.status,
    required this.parentId,
    this.gender,
    this.photoUrl,
    this.medicalNotes,
    this.emergencyContactName,
    this.emergencyContactPhone,
  });

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: json['id'] as String,
        firstName: json['firstName'] as String,
        lastName: json['lastName'] as String,
        dateOfBirth: DateTime.parse(json['dateOfBirth'] as String),
        gender: json['gender'] as String?,
        photoUrl: json['photoUrl'] as String?,
        medicalNotes: json['medicalNotes'] as String?,
        emergencyContactName: json['emergencyContactName'] as String?,
        emergencyContactPhone: json['emergencyContactPhone'] as String?,
        status: json['status'] as String,
        parentId: json['parentId'] as String,
      );

  final String id;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final String? gender;
  final String? photoUrl;
  final String? medicalNotes;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final String status;
  final String parentId;

  String get fullName => '$firstName $lastName';

  int get age {
    final now = DateTime.now();
    var years = now.year - dateOfBirth.year;
    if (now.month < dateOfBirth.month ||
        (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
      years--;
    }
    return years;
  }
}
