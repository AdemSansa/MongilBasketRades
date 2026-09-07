package com.mongilbasket.player;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

public record PlayerUpdateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull @Past LocalDate dateOfBirth,
        Gender gender,
        String photoUrl,
        String medicalNotes,
        String emergencyContactName,
        String emergencyContactPhone) {
}
