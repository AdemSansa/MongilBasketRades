import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'training_session.dart';

class SessionsRepository {
  SessionsRepository(this._dio);

  final Dio _dio;

  Future<List<TrainingSession>> today() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.sessionsToday);
      final data = response.data!['data'] as List<dynamic>;
      return data.map((json) => TrainingSession.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<TrainingSessionDetail> getDetail(String id) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.session(id));
      return TrainingSessionDetail.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<TrainingSession> cancel(String id) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(ApiConstants.sessionCancel(id));
      return TrainingSession.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<TrainingSession> complete(String id) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(ApiConstants.sessionComplete(id));
      return TrainingSession.fromJson(response.data!['data'] as Map<String, dynamic>);
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
