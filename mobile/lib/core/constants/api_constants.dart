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

  static const String players = '/players';
  static const String myChildren = '/parents/me/children';

  static String player(String id) => '/players/$id';

  static const String seasons = '/seasons';
  static const String groups = '/groups';
  static const String registrations = '/registrations';
  static const String myRegistrations = '/registrations/me';

  static String registrationCancel(String id) => '/registrations/$id/cancel';

  static const String sessionsToday = '/sessions/today';

  static String session(String id) => '/sessions/$id';
  static String sessionCancel(String id) => '/sessions/$id/cancel';
  static String sessionComplete(String id) => '/sessions/$id/complete';
}
