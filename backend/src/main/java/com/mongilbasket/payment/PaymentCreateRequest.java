package com.mongilbasket.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PaymentCreateRequest(
        @NotNull UUID playerId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
        String currency,
        @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}", message = "Period must be in YYYY-MM format") String period,
        LocalDate paymentDate,
        PaymentMethod method,
        @NotNull PaymentStatus status,
        String reference,
        String notes) {
}
