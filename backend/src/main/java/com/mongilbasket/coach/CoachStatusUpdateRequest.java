package com.mongilbasket.coach;

import com.mongilbasket.user.UserStatus;

import jakarta.validation.constraints.NotNull;

public record CoachStatusUpdateRequest(@NotNull UserStatus status) {}
