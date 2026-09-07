package com.mongilbasket.player;

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
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    public ApiResponse<List<PlayerResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PlayerStatus status) {
        return ApiResponse.ok(playerService.list(search, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<PlayerResponse> get(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(playerService.get(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARENT')")
    public ResponseEntity<ApiResponse<PlayerResponse>> create(
            @Valid @RequestBody PlayerCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(playerService.create(request, currentUser)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARENT')")
    public ApiResponse<PlayerResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlayerUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(playerService.update(id, request, currentUser));
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PlayerResponse> archive(@PathVariable UUID id) {
        return ApiResponse.ok(playerService.archive(id));
    }
}
