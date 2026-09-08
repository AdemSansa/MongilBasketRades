package com.mongilbasket.attendance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findBySessionId(UUID sessionId);

    Optional<Attendance> findBySessionIdAndPlayerId(UUID sessionId, UUID playerId);

    @Query("SELECT a FROM Attendance a WHERE a.player.id = :playerId ORDER BY a.session.date DESC, a.session.startTime DESC")
    List<Attendance> findByPlayerIdOrderBySessionDateDesc(@Param("playerId") UUID playerId);
}
