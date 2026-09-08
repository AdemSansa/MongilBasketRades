package com.mongilbasket.attendance;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;
import com.mongilbasket.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<SessionAttendanceResponse> getForSession(
            @PathVariable UUID sessionId, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(attendanceService.getForSession(sessionId, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<List<AttendanceResponse>> bulkUpsert(
            @Valid @RequestBody AttendanceBulkUpsertRequest request, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(attendanceService.bulkUpsert(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<AttendanceResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody AttendanceUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(attendanceService.update(id, request, currentUser));
    }
}
