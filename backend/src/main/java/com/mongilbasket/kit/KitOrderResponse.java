package com.mongilbasket.kit;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record KitOrderResponse(
        UUID id,
        UUID playerId,
        String playerName,
        KitSize size,
        BigDecimal amount,
        KitOrderStatus status,
        String paymentStatus,
        LocalDate paymentDate,
        String method,
        String reference,
        String notes,
        UUID orderedById,
        Instant createdAt) {

    public static KitOrderResponse from(KitOrder order) {
        return new KitOrderResponse(
                order.getId(),
                order.getPlayer().getId(),
                order.getPlayer().getFirstName() + " " + order.getPlayer().getLastName(),
                order.getSize(),
                order.getAmount(),
                order.getStatus(),
                order.getPaymentStatus().name(),
                order.getPaymentDate(),
                order.getMethod() != null ? order.getMethod().name() : null,
                order.getReference(),
                order.getNotes(),
                order.getOrderedBy().getId(),
                order.getCreatedAt());
    }
}
