package com.mongilbasket.coach;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;

import jakarta.validation.Valid;
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

    @GetMapping("/{id}")
    public ApiResponse<CoachDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(coachService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CoachDetailResponse>> create(@Valid @RequestBody CoachCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(coachService.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<CoachDetailResponse> update(@PathVariable UUID id, @Valid @RequestBody CoachUpdateRequest request) {
        return ApiResponse.ok(coachService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<CoachDetailResponse> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody CoachStatusUpdateRequest request) {
        return ApiResponse.ok(coachService.updateStatus(id, request));
    }
}
