import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'attendance_mark.dart';

class AttendanceRepository {
  AttendanceRepository(this._dio);

  final Dio _dio;

  Future<SessionAttendance> getForSession(String sessionId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.attendanceForSession(sessionId));
      return SessionAttendance.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<void> mark(String sessionId, String playerId, String status) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        ApiConstants.attendanceMark,
        data: {
          'sessionId': sessionId,
          'marks': [
            {'playerId': playerId, 'status': status},
          ],
        },
      );
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<void> markAll(String sessionId, List<String> playerIds, String status) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        ApiConstants.attendanceMark,
        data: {
          'sessionId': sessionId,
          'marks': playerIds.map((id) => {'playerId': id, 'status': status}).toList(),
        },
      );
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<PlayerAttendanceSummary> forPlayer(String playerId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.playerAttendance(playerId));
      return PlayerAttendanceSummary.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  String _extractMessage(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'] as String;
    }
    return switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.receiveTimeout ||
      DioExceptionType.connectionError =>
        'Unable to reach the server. Check your connection.',
      _ => 'Something went wrong. Please try again.',
    };
  }
}
