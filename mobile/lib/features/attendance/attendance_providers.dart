import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/network_providers.dart';
import 'attendance_mark.dart';
import 'attendance_repository.dart';

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  return AttendanceRepository(ref.watch(dioProvider));
});

final playerAttendanceSummaryProvider =
    FutureProvider.family<PlayerAttendanceSummary, String>((ref, playerId) {
  return ref.watch(attendanceRepositoryProvider).forPlayer(playerId);
});
