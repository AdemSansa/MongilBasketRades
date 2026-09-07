package com.mongilbasket.registration;

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
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<RegistrationResponse>> list(
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) UUID seasonId,
            @RequestParam(required = false) UUID groupId) {
        return ApiResponse.ok(registrationService.list(status, seasonId, groupId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<RegistrationResponse>> myRegistrations(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(registrationService.myRegistrations(currentUser));
    }

    @GetMapping("/{id}")
    public ApiResponse<RegistrationResponse> get(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(registrationService.get(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<RegistrationResponse>> create(
            @Valid @RequestBody RegistrationCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(registrationService.create(request, currentUser)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RegistrationResponse> approve(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(registrationService.approve(id, currentUser));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RegistrationResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrationRejectRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(registrationService.reject(id, request, currentUser));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<RegistrationResponse> cancel(
            @PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(registrationService.cancel(id, currentUser));
    }
}
