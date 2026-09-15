package com.mongilbasket.kit;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface KitOrderRepository extends JpaRepository<KitOrder, UUID>, JpaSpecificationExecutor<KitOrder> {}
