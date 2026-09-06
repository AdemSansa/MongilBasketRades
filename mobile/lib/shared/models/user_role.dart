enum UserRole {
  admin,
  coach,
  parent;

  static UserRole fromApi(String value) {
    switch (value.toUpperCase()) {
      case 'ADMIN':
        return UserRole.admin;
      case 'COACH':
        return UserRole.coach;
      case 'PARENT':
        return UserRole.parent;
      default:
        throw ArgumentError('Unknown role: $value');
    }
  }
}
