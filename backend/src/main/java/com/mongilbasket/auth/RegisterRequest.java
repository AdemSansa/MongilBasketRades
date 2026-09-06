package com.mongilbasket.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Creates a PARENT account only — see docs/api/endpoints.md. */
public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone) {
}
