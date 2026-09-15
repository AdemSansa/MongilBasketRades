package com.mongilbasket.kit;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;
import com.mongilbasket.payment.PaymentStatus;
import com.mongilbasket.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Team kit orders -- recorded in person today; a self-service request flow for parents/players is planned later. */
@RestController
@RequestMapping("/api/kit-orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class KitOrderController {

    private final KitOrderService kitOrderService;

    @GetMapping
    public ApiResponse<List<KitOrderResponse>> list(
            @RequestParam(required = false) KitOrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) UUID playerId) {
        return ApiResponse.ok(kitOrderService.list(status, paymentStatus, playerId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KitOrderResponse>> create(
            @Valid @RequestBody KitOrderCreateRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(kitOrderService.create(request, currentUser)));
    }

    @PutMapping("/{id}")
    public ApiResponse<KitOrderResponse> update(@PathVariable UUID id, @Valid @RequestBody KitOrderUpdateRequest request) {
        return ApiResponse.ok(kitOrderService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<KitOrderResponse> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody KitOrderStatusUpdateRequest request) {
        return ApiResponse.ok(kitOrderService.updateStatus(id, request));
    }

    @PatchMapping("/status/batch")
    public ApiResponse<List<KitOrderResponse>> updateStatusBatch(
            @Valid @RequestBody KitOrderStatusBatchUpdateRequest request) {
        return ApiResponse.ok(kitOrderService.updateStatusBatch(request));
    }
}
