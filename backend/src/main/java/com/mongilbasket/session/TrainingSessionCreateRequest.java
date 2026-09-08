package com.mongilbasket.session;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/** coachId is optional — defaults to the group's assigned coach if omitted. */
public record TrainingSessionCreateRequest(
        @NotNull UUID groupId,
        UUID coachId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String location,
        String notes) {
}
