import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/errors/app_exception.dart';
import 'payment.dart';

class PaymentsRepository {
  PaymentsRepository(this._dio);

  final Dio _dio;

  Future<List<Payment>> forPlayer(String playerId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiConstants.playerPayments(playerId));
      final data = response.data!['data'] as List<dynamic>;
      return data.map((json) => Payment.fromJson(json as Map<String, dynamic>)).toList();
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
