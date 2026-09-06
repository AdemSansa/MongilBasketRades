package com.mongilbasket.auth;

import java.util.UUID;

import com.mongilbasket.user.User;

public record UserResponse(UUID id, String email, String firstName, String lastName, String role) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name());
    }
}
