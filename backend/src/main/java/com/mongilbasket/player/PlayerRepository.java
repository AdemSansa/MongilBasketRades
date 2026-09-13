package com.mongilbasket.player;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PlayerRepository extends JpaRepository<Player, UUID>, JpaSpecificationExecutor<Player> {

    List<Player> findByParentId(UUID parentId);

    long countByCurrentGroupIdAndStatus(UUID currentGroupId, PlayerStatus status);

    long countByStatus(PlayerStatus status);

    List<Player> findByCurrentGroupIdAndStatus(UUID currentGroupId, PlayerStatus status);

    List<Player> findByStatus(PlayerStatus status);
}
