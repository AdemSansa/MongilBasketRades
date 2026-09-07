package com.mongilbasket.registration;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/** Season is always the currently active one — not client-supplied. */
public record RegistrationCreateRequest(@NotNull UUID playerId, @NotNull UUID groupId) {
}
