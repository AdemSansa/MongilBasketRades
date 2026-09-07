package com.mongilbasket.season;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeasonRepository extends JpaRepository<Season, UUID> {

    boolean existsByName(String name);

    Optional<Season> findByActiveTrue();
}
