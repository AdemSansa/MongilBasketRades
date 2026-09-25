package com.mongilbasket.parent;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ParentCreateRequest(
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        String address) {
}
