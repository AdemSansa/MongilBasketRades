package com.mongilbasket.session;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;
import com.mongilbasket.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TrainingSessionController {

    private final TrainingSessionService sessionService;

    @GetMapping
    public ApiResponse<List<TrainingSessionResponse>> list(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) UUID coachId,
            @RequestParam(required = false) LocalDate date,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(sessionService.list(groupId, coachId, date, currentUser));
    }

    @GetMapping("/today")
    public ApiResponse<List<TrainingSessionResponse>> today(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(sessionService.today(currentUser));
    }

    @GetMapping("/{id}")
    public ApiResponse<TrainingSessionDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(sessionService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TrainingSessionResponse>> create(
            @Valid @RequestBody TrainingSessionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(sessionService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<TrainingSessionResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody TrainingSessionUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(sessionService.update(id, request, currentUser));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<TrainingSessionResponse> cancel(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(sessionService.cancel(id, currentUser));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<TrainingSessionResponse> complete(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(sessionService.complete(id, currentUser));
    }
}
