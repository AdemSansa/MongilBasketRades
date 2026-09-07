package com.mongilbasket.registration;

import jakarta.validation.constraints.NotBlank;

public record RegistrationRejectRequest(@NotBlank String notes) {
}
