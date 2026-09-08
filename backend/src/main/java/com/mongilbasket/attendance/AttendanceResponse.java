package com.mongilbasket.attendance;

import java.time.Instant;
import java.util.UUID;

public record AttendanceResponse(
        UUID id,
        UUID sessionId,
        UUID playerId,
        String playerName,
        String status,
        UUID markedById,
        Instant markedAt,
        String notes) {

    public static AttendanceResponse from(Attendance a) {
        return new AttendanceResponse(
                a.getId(),
                a.getSession().getId(),
                a.getPlayer().getId(),
                a.getPlayer().getFirstName() + " " + a.getPlayer().getLastName(),
                a.getStatus().name(),
                a.getMarkedBy().getId(),
                a.getMarkedAt(),
                a.getNotes());
    }
}
