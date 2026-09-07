package com.mongilbasket.registration;

import java.time.Instant;
import java.util.UUID;

public record RegistrationResponse(
        UUID id,
        UUID playerId,
        String playerName,
        UUID parentId,
        UUID seasonId,
        UUID requestedGroupId,
        String requestedGroupName,
        String status,
        Instant registrationDate,
        UUID reviewedById,
        Instant reviewedAt,
        String notes) {

    public static RegistrationResponse from(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getPlayer().getId(),
                r.getPlayer().getFirstName() + " " + r.getPlayer().getLastName(),
                r.getParent().getId(),
                r.getSeason().getId(),
                r.getRequestedGroup().getId(),
                r.getRequestedGroup().getName(),
                r.getStatus().name(),
                r.getRegistrationDate(),
                r.getReviewedBy() != null ? r.getReviewedBy().getId() : null,
                r.getReviewedAt(),
                r.getNotes());
    }
}
