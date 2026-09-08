class Season {
  const Season({required this.id, required this.name, required this.isActive});

  factory Season.fromJson(Map<String, dynamic> json) => Season(
        id: json['id'] as String,
        name: json['name'] as String,
        isActive: json['isActive'] as bool,
      );

  final String id;
  final String name;
  final bool isActive;
}
