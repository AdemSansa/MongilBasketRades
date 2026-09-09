import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'parent_dashboard.dart';

class ParentDashboardRepository {
  ParentDashboardRepository(this._dio);

  final Dio _dio;

  Future<List<ChildDashboardSummary>> get() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.parentDashboard);
      final children = response.data!['data']['children'] as List<dynamic>;
      return children.map((json) => ChildDashboardSummary.fromJson(json as Map<String, dynamic>)).toList();
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
