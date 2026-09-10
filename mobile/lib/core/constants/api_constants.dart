class ApiConstants {
  ApiConstants._();

  // Dev machine's LAN IP for local testing — check `ipconfig` /
  // Get-NetIPAddress if this stops responding, it changes whenever the
  // network changes (Wi-Fi vs hotspot, DHCP lease renewal, etc).
  // Swap to 'https://mongilbasketrades.onrender.com/api' to test against
  // the live Render deployment instead (see docs/deployment/DEPLOY.md).
  static const String baseUrl = 'http://172.20.10.2:8080/api';

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

  static const String attendanceMark = '/attendance';

  static String attendanceForSession(String sessionId) => '/attendance/session/$sessionId';
  static String playerAttendance(String playerId) => '/players/$playerId/attendance';

  static String playerPayments(String playerId) => '/players/$playerId/payments';

  static const String parentDashboard = '/dashboard/parent';
}
