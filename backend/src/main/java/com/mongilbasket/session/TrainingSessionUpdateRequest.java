package com.mongilbasket.session;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record TrainingSessionUpdateRequest(
        @NotNull UUID groupId,
        UUID coachId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String location,
        String notes) {
}
