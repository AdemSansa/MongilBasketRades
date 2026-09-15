package com.mongilbasket.kit;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.mongilbasket.payment.PaymentStatus;

final class KitOrderSpecifications {

    private KitOrderSpecifications() {
    }

    static Specification<KitOrder> statusEquals(KitOrderStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<KitOrder> paymentStatusEquals(PaymentStatus paymentStatus) {
        if (paymentStatus == null) return null;
        return (root, query, cb) -> cb.equal(root.get("paymentStatus"), paymentStatus);
    }

    static Specification<KitOrder> playerIdEquals(UUID playerId) {
        if (playerId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("player").get("id"), playerId);
    }

    static Specification<KitOrder> paymentDateGte(LocalDate from) {
        if (from == null) return null;
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("paymentDate"), from);
    }

    static Specification<KitOrder> paymentDateLte(LocalDate to) {
        if (to == null) return null;
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("paymentDate"), to);
    }
}
