package com.mongilbasket.parent;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;
import com.mongilbasket.player.PlayerResponse;
import com.mongilbasket.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/me/children")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<PlayerResponse>> myChildren(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(parentService.myChildren(currentUser));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ParentResponse>> list() {
        return ApiResponse.ok(parentService.list());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParentResponse>> create(@Valid @RequestBody ParentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(parentService.create(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ParentDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(parentService.get(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ParentResponse> adminUpdate(
            @PathVariable UUID id, @Valid @RequestBody ParentAdminUpdateRequest request) {
        return ApiResponse.ok(parentService.adminUpdate(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ParentResponse> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody ParentStatusUpdateRequest request) {
        return ApiResponse.ok(parentService.updateStatus(id, request));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> resetPassword(@PathVariable UUID id) {
        parentService.resetPassword(id);
        return ApiResponse.ok("Password reset and emailed");
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<ParentResponse> updateMe(
            @Valid @RequestBody ParentUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(parentService.updateMe(request, currentUser));
    }
}
