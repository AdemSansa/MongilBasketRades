import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'group.dart';
import 'season.dart';

class GroupsRepository {
  GroupsRepository(this._dio);

  final Dio _dio;

  Future<Season?> activeSeason() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.seasons);
      final data = response.data!['data'] as List<dynamic>;
      final seasons = data.map((json) => Season.fromJson(json as Map<String, dynamic>)).toList();
      for (final season in seasons) {
        if (season.isActive) return season;
      }
      return null;
    } on DioException catch (e) {
      throw AppException(_extractMessage(e));
    }
  }

  Future<List<Group>> groupsForSeason(String seasonId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        ApiConstants.groups,
        queryParameters: {'seasonId': seasonId, 'status': 'ACTIVE'},
      );
      final data = response.data!['data'] as List<dynamic>;
      return data.map((json) => Group.fromJson(json as Map<String, dynamic>)).toList();
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
