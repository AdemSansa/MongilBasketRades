import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

/// Builds the shared Dio instance: base URL, timeouts, and an interceptor
/// that attaches the JWT access token to every request. Token refresh on
/// 401 will be added once POST /auth/refresh exists on the backend (Phase 3).
Dio buildDioClient(TokenStorage tokenStorage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      // Render's free tier spins the backend down after ~15 min idle;
      // the first request after that wakes it up and can take 30-60s
      // before it responds at all. 10s (fine for local/always-on dev)
      // guaranteed a timeout on every cold start against the live
      // deployment — 60s gives real margin over that documented window.
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
      contentType: 'application/json',
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStorage.readAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
  );

  return dio;
}
