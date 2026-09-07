package com.mongilbasket.player;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

/** parentId is required when the caller is ADMIN, ignored (forced to self) when the caller is PARENT. */
public record PlayerCreateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull @Past LocalDate dateOfBirth,
        Gender gender,
        String photoUrl,
        String medicalNotes,
        String emergencyContactName,
        String emergencyContactPhone,
        UUID parentId) {
}
