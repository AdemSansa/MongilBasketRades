package com.mongilbasket.report;

import java.util.List;

public record MonthlyAttendanceReportResponse(int year, int month, List<GroupAttendanceReport> groups) {
}
