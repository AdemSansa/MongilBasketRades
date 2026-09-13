package com.mongilbasket.coach;

import java.util.List;
import java.util.UUID;

import com.mongilbasket.group.Group;
import com.mongilbasket.user.UserStatus;

public record CoachDetailResponse(
        UUID id,
        UUID userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String bio,
        UserStatus status,
        List<CoachGroupSummary> groups) {

    public static CoachDetailResponse from(Coach coach, List<Group> groups) {
        return new CoachDetailResponse(
                coach.getId(),
                coach.getUser().getId(),
                coach.getUser().getFirstName(),
                coach.getUser().getLastName(),
                coach.getUser().getEmail(),
                coach.getUser().getPhone(),
                coach.getBio(),
                coach.getUser().getStatus(),
                groups.stream().map(CoachGroupSummary::from).toList());
    }
}
