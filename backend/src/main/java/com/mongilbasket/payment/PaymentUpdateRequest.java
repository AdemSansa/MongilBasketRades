package com.mongilbasket.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record PaymentUpdateRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
        LocalDate paymentDate,
        PaymentMethod method,
        @NotNull PaymentStatus status,
        String reference,
        String notes) {
}
