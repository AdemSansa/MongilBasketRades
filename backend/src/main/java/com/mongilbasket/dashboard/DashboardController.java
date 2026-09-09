package com.mongilbasket.dashboard;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminDashboardResponse> admin() {
        return ApiResponse.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/parent")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<ParentDashboardResponse> parent(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(dashboardService.getParentDashboard(currentUser));
    }
}
