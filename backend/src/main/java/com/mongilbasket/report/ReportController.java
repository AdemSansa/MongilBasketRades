package com.mongilbasket.report;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final MonthlyAttendanceReportService reportService;

    @GetMapping("/monthly-attendance")
    public ApiResponse<MonthlyAttendanceReportResponse> monthlyAttendance(
            @RequestParam(required = false) UUID coachId,
            @RequestParam int year,
            @RequestParam int month) {
        return ApiResponse.ok(reportService.build(coachId, year, month));
    }
}
