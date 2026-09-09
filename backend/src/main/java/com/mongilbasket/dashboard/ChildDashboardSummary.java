package com.mongilbasket.dashboard;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ChildDashboardSummary(
        UUID playerId,
        String playerName,
        String groupName,
        LocalDate nextTrainingDate,
        LocalTime nextTrainingTime,
        Double attendanceRate,
        String paymentStatus) {
}
