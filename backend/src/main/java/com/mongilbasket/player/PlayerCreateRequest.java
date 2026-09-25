package com.mongilbasket.player;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

/**
 * parentId is optional for ADMIN (walk-in players can be registered before a parent account exists)
 * and ignored (forced to self) when the caller is PARENT. groupId is ADMIN-only and optional.
 */
public record PlayerCreateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull @Past LocalDate dateOfBirth,
        Gender gender,
        String photoUrl,
        String medicalNotes,
        String emergencyContactName,
        String emergencyContactPhone,
        UUID parentId,
        UUID groupId) {
}
