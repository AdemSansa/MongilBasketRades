package com.mongilbasket.attendance;

import jakarta.validation.constraints.NotNull;

public record AttendanceUpdateRequest(@NotNull AttendanceStatus status, String notes) {
}
