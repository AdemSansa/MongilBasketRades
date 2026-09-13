package com.mongilbasket.payment;

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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentStatusReportService paymentStatusReportService;

    @GetMapping("/monthly-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MonthlyPaymentStatusResponse> monthlyStatus(
            @RequestParam int year, @RequestParam int month, @RequestParam(required = false) UUID coachId) {
        return ApiResponse.ok(paymentStatusReportService.build(year, month, coachId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PaymentResponse>> list(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) UUID playerId,
            @RequestParam(required = false) PaymentType type) {
        return ApiResponse.ok(paymentService.list(status, period, playerId, type));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<PaymentResponse>> mine(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(paymentService.listForParent(currentUser));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> create(
            @Valid @RequestBody PaymentCreateRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(paymentService.create(request, currentUser)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(paymentService.update(id, request, currentUser));
    }
}
