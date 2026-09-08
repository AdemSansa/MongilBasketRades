package com.mongilbasket.payment;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

final class PaymentSpecifications {

    private PaymentSpecifications() {
    }

    static Specification<Payment> statusEquals(PaymentStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Payment> periodEquals(String period) {
        if (period == null) return null;
        return (root, query, cb) -> cb.equal(root.get("period"), period);
    }

    static Specification<Payment> playerIdEquals(UUID playerId) {
        if (playerId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("player").get("id"), playerId);
    }
}
