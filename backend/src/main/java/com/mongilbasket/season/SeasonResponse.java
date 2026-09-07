package com.mongilbasket.season;

import java.time.LocalDate;
import java.util.UUID;

public record SeasonResponse(UUID id, String name, LocalDate startDate, LocalDate endDate, boolean isActive) {

    public static SeasonResponse from(Season season) {
        return new SeasonResponse(
                season.getId(), season.getName(), season.getStartDate(), season.getEndDate(), season.isActive());
    }
}
