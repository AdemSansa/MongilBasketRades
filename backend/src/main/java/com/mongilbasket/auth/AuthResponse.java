package com.mongilbasket.auth;

public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {
}
