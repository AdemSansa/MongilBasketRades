package com.mongilbasket.parent;

import jakarta.validation.constraints.NotBlank;

public record ParentAdminUpdateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        String address) {}
