import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'registration.dart';

class RegistrationsRepository {
  RegistrationsRepository(this._dio);

  final Dio _dio;

  Future<List<Registration>> myRegistrations() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.myRegistrations);
      final data = response.data!['data'] as List<dynamic>;
      return data.map((json) => Registration.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<Registration> submit({required String playerId, required String groupId}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        ApiConstants.registrations,
        data: {'playerId': playerId, 'groupId': groupId},
      );
      return Registration.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<Registration> cancel(String id) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(ApiConstants.registrationCancel(id));
      return Registration.fromJson(response.data!['data'] as Map<String, dynamic>);
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
