package com.mongilbasket.group;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ApiResponse<List<GroupResponse>> list(
            @RequestParam(required = false) UUID seasonId,
            @RequestParam(required = false) GroupStatus status) {
        return ApiResponse.ok(groupService.list(seasonId, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<GroupResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(groupService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GroupResponse>> create(@Valid @RequestBody GroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(groupService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<GroupResponse> update(@PathVariable UUID id, @Valid @RequestBody GroupUpdateRequest request) {
        return ApiResponse.ok(groupService.update(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<GroupResponse> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody GroupStatusUpdateRequest request) {
        return ApiResponse.ok(groupService.setStatus(id, request.status()));
    }
}
