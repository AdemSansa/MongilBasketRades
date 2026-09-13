package com.mongilbasket.coach;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CoachCreateRequest(
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        String bio) {}
