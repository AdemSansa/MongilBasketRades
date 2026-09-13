package com.mongilbasket.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** status/amount/paymentDate are null when no MEMBERSHIP payment record exists yet for the player+period. */
public record PlayerPaymentStatusRow(
        UUID playerId,
        String playerName,
        String groupName,
        String coachName,
        PaymentStatus status,
        BigDecimal amount,
        LocalDate paymentDate) {

    public boolean paid() {
        return status == PaymentStatus.PAID;
    }
}
