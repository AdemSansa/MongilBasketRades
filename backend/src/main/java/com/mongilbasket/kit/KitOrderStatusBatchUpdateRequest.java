package com.mongilbasket.kit;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record KitOrderStatusBatchUpdateRequest(@NotEmpty List<UUID> ids, @NotNull KitOrderStatus status) {
}
