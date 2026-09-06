class AppException implements Exception {
  const AppException(this.message);

  final String message;

  @override
  String toString() => message;
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Session expired. Please log in again.']);
}

class NetworkException extends AppException {
  const NetworkException([super.message = 'Unable to reach the server.']);
}
