package com.mongilbasket.group;

import jakarta.validation.constraints.NotNull;

public record GroupStatusUpdateRequest(@NotNull GroupStatus status) {
}
