package com.mongilbasket.registration;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    boolean existsByPlayerIdAndSeasonIdAndStatusIn(UUID playerId, UUID seasonId, List<RegistrationStatus> statuses);

    List<Registration> findByParentId(UUID parentId);

    long countByStatus(RegistrationStatus status);

    @Query("SELECT r FROM Registration r WHERE "
            + "(:status IS NULL OR r.status = :status) AND "
            + "(:seasonId IS NULL OR r.season.id = :seasonId) AND "
            + "(:groupId IS NULL OR r.requestedGroup.id = :groupId)")
    List<Registration> search(
            @Param("status") RegistrationStatus status,
            @Param("seasonId") UUID seasonId,
            @Param("groupId") UUID groupId);
}
