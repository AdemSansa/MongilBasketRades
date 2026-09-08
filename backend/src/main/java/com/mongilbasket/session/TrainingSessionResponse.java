package com.mongilbasket.session;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record TrainingSessionResponse(
        UUID id,
        UUID groupId,
        String groupName,
        UUID coachId,
        String coachName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        String status,
        String notes) {

    public static TrainingSessionResponse from(TrainingSession s) {
        return new TrainingSessionResponse(
                s.getId(),
                s.getGroup().getId(),
                s.getGroup().getName(),
                s.getCoach().getId(),
                s.getCoach().getUser().getFirstName() + " " + s.getCoach().getUser().getLastName(),
                s.getDate(),
                s.getStartTime(),
                s.getEndTime(),
                s.getLocation(),
                s.getStatus().name(),
                s.getNotes());
    }
}
