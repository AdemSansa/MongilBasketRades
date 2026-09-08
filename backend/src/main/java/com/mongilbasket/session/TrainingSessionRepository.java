package com.mongilbasket.session;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Uses Specifications (see TrainingSessionSpecifications) instead of a
 * JPQL "(:param IS NULL OR ...)" query for the optional filters — that
 * pattern kept hitting Postgres parameter-type-inference failures (a null
 * LocalDate binds as untyped bytea, and there's no bytea->date cast at
 * all, so even CAST(:date AS date) errored outright; see git history for
 * the two failed attempts). Specifications never bind a parameter for a
 * filter that isn't actually supplied, which sidesteps the problem
 * entirely rather than working around it.
 */
public interface TrainingSessionRepository
        extends JpaRepository<TrainingSession, UUID>, JpaSpecificationExecutor<TrainingSession> {
}
