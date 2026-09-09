package com.mongilbasket.coach;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;

import lombok.RequiredArgsConstructor;

/** Coach.id (used by Group.coachId) differs from the linked User.id, so admin-side pickers need this rather than /api/users. */
@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CoachController {

    private final CoachService coachService;

    @GetMapping
    public ApiResponse<List<CoachResponse>> list() {
        return ApiResponse.ok(coachService.list());
    }
}
