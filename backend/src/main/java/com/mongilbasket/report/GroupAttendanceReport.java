package com.mongilbasket.report;

import java.util.List;
import java.util.UUID;

public record GroupAttendanceReport(
        UUID groupId,
        String groupName,
        String coachName,
        List<ReportSession> sessions,
        List<PlayerAttendanceRow> players) {
}
