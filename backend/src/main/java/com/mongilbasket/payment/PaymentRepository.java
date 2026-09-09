package com.mongilbasket.payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByPlayerIdAndPeriod(UUID playerId, String period);

    List<Payment> findByPlayerIdOrderByPeriodDesc(UUID playerId);

    List<Payment> findByParentIdOrderByPeriodDesc(UUID parentId);

    long countByStatusIn(List<PaymentStatus> statuses);
}
