package com.mongilbasket.group;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GroupUpdateRequest(
        @NotBlank String name,
        @NotNull UUID seasonId,
        @NotNull @Min(0) Integer ageMin,
        @NotNull @Min(0) Integer ageMax,
        @NotNull @Min(1) Integer capacity,
        UUID coachId) {
}
