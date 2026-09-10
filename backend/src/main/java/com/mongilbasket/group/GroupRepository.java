package com.mongilbasket.group;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, UUID> {

    @Query("SELECT g FROM Group g WHERE "
            + "(:seasonId IS NULL OR g.season.id = :seasonId) AND "
            + "(:status IS NULL OR g.status = :status)")
    List<Group> search(@Param("seasonId") UUID seasonId, @Param("status") GroupStatus status);

    List<Group> findByCoachIdAndStatus(UUID coachId, GroupStatus status);
}
