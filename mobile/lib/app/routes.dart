import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_controller.dart';
import '../features/auth/login_screen.dart';
import '../features/dashboard/admin_dashboard_screen.dart';
import '../features/dashboard/coach_dashboard_screen.dart';
import '../features/dashboard/parent_home_screen.dart';
import '../shared/models/user_role.dart';

/// Bridges Riverpod's authControllerProvider to GoRouter's
/// ChangeNotifier-based refreshListenable so route redirects re-evaluate
/// on login/logout.
class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Ref ref) {
    ref.listen(authControllerProvider, (_, _) => notifyListeners());
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = _AuthRefreshNotifier(ref);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final user = ref.read(authControllerProvider).valueOrNull;
      final isLoggingIn = state.matchedLocation == '/login';

      if (user == null) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn) {
        return switch (user.role) {
          UserRole.admin => '/admin/dashboard',
          UserRole.coach => '/coach/dashboard',
          UserRole.parent => '/parent/home',
        };
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/admin/dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/coach/dashboard',
        builder: (context, state) => const CoachDashboardScreen(),
      ),
      GoRoute(path: '/parent/home', builder: (context, state) => const ParentHomeScreen()),
    ],
  );
});
