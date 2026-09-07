package com.mongilbasket.player;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlayerRepository extends JpaRepository<Player, UUID> {

    List<Player> findByParentId(UUID parentId);

    // CAST(:search AS string) works around Postgres failing to infer a type
    // for a null bind parameter inside LOWER(CONCAT(...)) — without it,
    // a null :search causes "function lower(bytea) does not exist".
    @Query("SELECT p FROM Player p WHERE "
            + "(:status IS NULL OR p.status = :status) AND "
            + "(:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) "
            + "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    List<Player> search(@Param("status") PlayerStatus status, @Param("search") String search);
}
