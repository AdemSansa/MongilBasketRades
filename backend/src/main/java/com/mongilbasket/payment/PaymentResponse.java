package com.mongilbasket.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID playerId,
        String playerName,
        UUID parentId,
        BigDecimal amount,
        String currency,
        String type,
        String period,
        LocalDate paymentDate,
        String method,
        String status,
        String reference,
        UUID recordedById,
        String notes) {

    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getPlayer().getId(),
                p.getPlayer().getFirstName() + " " + p.getPlayer().getLastName(),
                p.getParent() != null ? p.getParent().getId() : null,
                p.getAmount(),
                p.getCurrency(),
                p.getType().name(),
                p.getPeriod(),
                p.getPaymentDate(),
                p.getMethod() != null ? p.getMethod().name() : null,
                p.getStatus().name(),
                p.getReference(),
                p.getRecordedBy().getId(),
                p.getNotes());
    }
}
