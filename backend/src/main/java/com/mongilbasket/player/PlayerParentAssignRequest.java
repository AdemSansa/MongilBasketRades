package com.mongilbasket.player;

import java.util.UUID;

/** A null parentId unlinks the player's current parent. */
public record PlayerParentAssignRequest(UUID parentId) {
}
