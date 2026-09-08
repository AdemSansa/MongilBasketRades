package com.mongilbasket.attendance;

import java.util.List;
import java.util.UUID;

/** attendanceRate = present / total, matching the PROJECT_SCOPE.md §13 example (17 present / 20 sessions = 85%) — late/excused/absent all count against the rate, only PRESENT counts for it. */
public record PlayerAttendanceSummary(
        UUID playerId,
        int totalSessions,
        int present,
        int absent,
        int late,
        int excused,
        double attendanceRate,
        List<AttendanceResponse> history) {
}
