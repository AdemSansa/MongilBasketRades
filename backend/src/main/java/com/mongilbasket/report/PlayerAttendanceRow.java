package com.mongilbasket.report;

import java.util.Map;
import java.util.UUID;

/** marksBySessionId: session id -> attendance status name, only present for sessions that were actually marked. */
public record PlayerAttendanceRow(
        UUID playerId,
        String playerName,
        Map<UUID, String> marksBySessionId,
        int presentCount,
        int totalSessions,
        double rate) {
}
