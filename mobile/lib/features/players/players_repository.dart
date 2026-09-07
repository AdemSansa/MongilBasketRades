import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'player.dart';

class PlayersRepository {
  PlayersRepository(this._dio);

  final Dio _dio;

  Future<List<Player>> myChildren() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.myChildren);
      final data = response.data!['data'] as List<dynamic>;
      return data.map((json) => Player.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<Player> createChild({
    required String firstName,
    required String lastName,
    required DateTime dateOfBirth,
    String? gender,
    String? emergencyContactName,
    String? emergencyContactPhone,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        ApiConstants.players,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'dateOfBirth': _formatDate(dateOfBirth),
          'gender': ?gender,
          'emergencyContactName': ?emergencyContactName,
          'emergencyContactPhone': ?emergencyContactPhone,
        },
      );
      return Player.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<Player> updateChild(
    String id, {
    required String firstName,
    required String lastName,
    required DateTime dateOfBirth,
    String? gender,
    String? medicalNotes,
    String? emergencyContactName,
    String? emergencyContactPhone,
  }) async {
    try {
      final response = await _dio.put<Map<String, dynamic>>(
        ApiConstants.player(id),
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'dateOfBirth': _formatDate(dateOfBirth),
          'gender': ?gender,
          'medicalNotes': ?medicalNotes,
          'emergencyContactName': ?emergencyContactName,
          'emergencyContactPhone': ?emergencyContactPhone,
        },
      );
      return Player.fromJson(response.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  String _extractMessage(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'] as String;
    }
    if (data is Map && data['data'] is Map) {
      final fieldErrors = (data['data'] as Map).values;
      if (fieldErrors.isNotEmpty) return fieldErrors.first.toString();
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
