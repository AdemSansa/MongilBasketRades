class ApiConstants {
  ApiConstants._();

  // Dev machine's LAN IP — the physical test device (M2101K7BNY) reaches
  // the backend over Wi-Fi this way. Swap for 10.0.2.2 (the Android
  // emulator's host alias) if testing on an emulator instead, or for a
  // real deployed URL once the backend is hosted somewhere.
  static const String baseUrl = 'http://192.168.100.105:8080/api';

  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
}
