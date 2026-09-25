package com.mongilbasket.parent;

import com.mongilbasket.user.UserStatus;

import jakarta.validation.constraints.NotNull;

public record ParentStatusUpdateRequest(@NotNull UserStatus status) {}
