package com.mongilbasket.coach;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachRepository extends JpaRepository<Coach, UUID> {

    Optional<Coach> findByUserId(UUID userId);
}
