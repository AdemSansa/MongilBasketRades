package com.mongilbasket.dashboard;

import java.util.List;

import com.mongilbasket.session.TrainingSessionResponse;

public record AdminDashboardResponse(
        long totalPlayers,
        long activePlayers,
        long pendingRegistrations,
        long waitingList,
        long activeCoaches,
        long todaysSessionsCount,
        long upcomingSessionsCount,
        long unpaidFees,
        double attendanceRate,
        List<TrainingSessionResponse> todaysSessions) {
}
