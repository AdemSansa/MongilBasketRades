package com.mongilbasket.kit;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.mongilbasket.payment.PaymentMethod;
import com.mongilbasket.payment.PaymentStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record KitOrderUpdateRequest(
        @NotNull KitSize size,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
        @NotNull PaymentStatus paymentStatus,
        LocalDate paymentDate,
        PaymentMethod method,
        String reference,
        String notes) {
}
