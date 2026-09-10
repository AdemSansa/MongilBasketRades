package com.mongilbasket.group;

import java.util.UUID;

import com.mongilbasket.coach.Coach;

public record GroupResponse(
        UUID id,
        String name,
        UUID seasonId,
        int ageMin,
        int ageMax,
        int capacity,
        long currentCount,
        UUID coachId,
        String coachName,
        String status) {

    public static GroupResponse from(Group group, long currentCount) {
        Coach coach = group.getCoach();
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getSeason().getId(),
                group.getAgeMin(),
                group.getAgeMax(),
                group.getCapacity(),
                currentCount,
                coach != null ? coach.getId() : null,
                coach != null ? coach.getUser().getFirstName() + " " + coach.getUser().getLastName() : null,
                group.getStatus().name());
    }
}
