package com.mongilbasket.attendance;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AttendanceMarkRequest(@NotNull UUID playerId, @NotNull AttendanceStatus status, String notes) {
}
