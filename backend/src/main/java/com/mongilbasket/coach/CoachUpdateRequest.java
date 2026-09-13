package com.mongilbasket.coach;

import jakarta.validation.constraints.NotBlank;

public record CoachUpdateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        String bio) {}
