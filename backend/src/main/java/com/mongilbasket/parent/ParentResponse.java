package com.mongilbasket.parent;

import java.util.UUID;

public record ParentResponse(
        UUID id,
        UUID userId,
        String email,
        String firstName,
        String lastName,
        String phone,
        String address,
        int childCount) {

    public static ParentResponse from(Parent parent, int childCount) {
        var user = parent.getUser();
        return new ParentResponse(
                parent.getId(),
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                parent.getAddress(),
                childCount);
    }
}
