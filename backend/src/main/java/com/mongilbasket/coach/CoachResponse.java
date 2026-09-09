package com.mongilbasket.coach;

import java.util.UUID;

public record CoachResponse(UUID id, UUID userId, String firstName, String lastName, String email) {

    public static CoachResponse from(Coach coach) {
        return new CoachResponse(
                coach.getId(),
                coach.getUser().getId(),
                coach.getUser().getFirstName(),
                coach.getUser().getLastName(),
                coach.getUser().getEmail());
    }
}
