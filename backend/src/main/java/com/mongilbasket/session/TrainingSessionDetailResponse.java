package com.mongilbasket.session;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.mongilbasket.player.Player;

/** Adds the group's current roster — used by the coach to take attendance (Phase 8 adds the actual marks). */
public record TrainingSessionDetailResponse(
        UUID id,
        UUID groupId,
        String groupName,
        UUID coachId,
        String coachName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        String status,
        String notes,
        List<RosterPlayer> roster) {

    public record RosterPlayer(UUID id, String firstName, String lastName) {
        static RosterPlayer from(Player p) {
            return new RosterPlayer(p.getId(), p.getFirstName(), p.getLastName());
        }
    }

    public static TrainingSessionDetailResponse from(TrainingSession s, List<Player> rosterPlayers) {
        return new TrainingSessionDetailResponse(
                s.getId(),
                s.getGroup().getId(),
                s.getGroup().getName(),
                s.getCoach().getId(),
                s.getCoach().getUser().getFirstName() + " " + s.getCoach().getUser().getLastName(),
                s.getDate(),
                s.getStartTime(),
                s.getEndTime(),
                s.getLocation(),
                s.getStatus().name(),
                s.getNotes(),
                rosterPlayers.stream().map(RosterPlayer::from).toList());
    }
}
