package com.mongilbasket.player;

import java.time.LocalDate;
import java.util.UUID;

public record PlayerResponse(
        UUID id,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String gender,
        String photoUrl,
        String medicalNotes,
        String emergencyContactName,
        String emergencyContactPhone,
        String status,
        LocalDate registrationDate,
        UUID parentId,
        UUID currentGroupId) {

    public static PlayerResponse from(Player player) {
        return new PlayerResponse(
                player.getId(),
                player.getFirstName(),
                player.getLastName(),
                player.getDateOfBirth(),
                player.getGender() != null ? player.getGender().name() : null,
                player.getPhotoUrl(),
                player.getMedicalNotes(),
                player.getEmergencyContactName(),
                player.getEmergencyContactPhone(),
                player.getStatus().name(),
                player.getRegistrationDate(),
                player.getParent().getId(),
                player.getCurrentGroup() != null ? player.getCurrentGroup().getId() : null);
    }
}
