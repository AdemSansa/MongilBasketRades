package com.mongilbasket.coach;

import java.util.UUID;

import com.mongilbasket.group.Group;

public record CoachGroupSummary(UUID id, String name) {

    public static CoachGroupSummary from(Group group) {
        return new CoachGroupSummary(group.getId(), group.getName());
    }
}
