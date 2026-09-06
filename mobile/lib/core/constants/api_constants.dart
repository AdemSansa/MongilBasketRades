class ApiConstants {
  ApiConstants._();

  // Android emulator alias for host localhost. Physical devices need the
  // machine's LAN IP instead (e.g. http://192.168.1.x:8080/api) until the
  // backend is deployed somewhere reachable.
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
}
