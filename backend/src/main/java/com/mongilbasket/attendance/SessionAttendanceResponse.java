package com.mongilbasket.attendance;

import java.util.List;
import java.util.UUID;

/** The session's full roster (from Phase 7) joined with whatever attendance marks already exist — status/attendanceId are null for a not-yet-marked player. */
public record SessionAttendanceResponse(UUID sessionId, List<RosterMark> roster) {

    public record RosterMark(UUID playerId, String playerName, String status, UUID attendanceId) {
    }
}
