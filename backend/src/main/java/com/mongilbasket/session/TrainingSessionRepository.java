package com.mongilbasket.session;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {

    // Both occurrences of :date need CAST(... AS date) — not just the
    // equality one. Postgres assigns each JPQL parameter *usage* its own
    // "$n" placeholder, and the bare "$n IS NULL" usage (with no other
    // context) is what actually fails type inference here, not the typed
    // equality usage. Same root cause as PlayerRepository.search's :search
    // cast, just biting a different one of the two usages this time.
    @Query("SELECT s FROM TrainingSession s WHERE "
            + "(:groupId IS NULL OR s.group.id = :groupId) AND "
            + "(:coachId IS NULL OR s.coach.id = :coachId) AND "
            + "(CAST(:date AS date) IS NULL OR s.date = CAST(:date AS date)) "
            + "ORDER BY s.date, s.startTime")
    List<TrainingSession> search(
            @Param("groupId") UUID groupId, @Param("coachId") UUID coachId, @Param("date") LocalDate date);
}
