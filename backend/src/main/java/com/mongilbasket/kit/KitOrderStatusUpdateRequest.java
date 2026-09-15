package com.mongilbasket.kit;

import jakarta.validation.constraints.NotNull;

public record KitOrderStatusUpdateRequest(@NotNull KitOrderStatus status) {
}
