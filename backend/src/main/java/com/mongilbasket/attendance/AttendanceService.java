package com.mongilbasket.attendance;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.session.TrainingSession;
import com.mongilbasket.session.TrainingSessionRepository;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TrainingSessionRepository sessionRepository;
    private final PlayerRepository playerRepository;

    @Transactional(readOnly = true)
    public SessionAttendanceResponse getForSession(UUID sessionId, User currentUser) {
        TrainingSession session = findSessionOrThrow(sessionId);
        ensureCanManageSession(session, currentUser);

        List<Player> roster =
                playerRepository.findByCurrentGroupIdAndStatus(session.getGroup().getId(), PlayerStatus.ACTIVE);
        Map<UUID, Attendance> byPlayerId = attendanceRepository.findBySessionId(sessionId).stream()
                .collect(Collectors.toMap(a -> a.getPlayer().getId(), Function.identity()));

        List<SessionAttendanceResponse.RosterMark> rows = roster.stream()
                .map(p -> {
                    Attendance existing = byPlayerId.get(p.getId());
                    return new SessionAttendanceResponse.RosterMark(
                            p.getId(),
                            p.getFirstName() + " " + p.getLastName(),
                            existing != null ? existing.getStatus().name() : null,
                            existing != null ? existing.getId() : null);
                })
                .toList();

        return new SessionAttendanceResponse(sessionId, rows);
    }

    @Transactional
    public List<AttendanceResponse> bulkUpsert(AttendanceBulkUpsertRequest request, User currentUser) {
        TrainingSession session = findSessionOrThrow(request.sessionId());
        ensureCanManageSession(session, currentUser);

        List<Attendance> saved = new ArrayList<>();
        for (AttendanceMarkRequest mark : request.marks()) {
            Player player = playerRepository.findById(mark.playerId())
                    .orElseThrow(() -> new NotFoundException("Player not found: " + mark.playerId()));

            Attendance attendance = attendanceRepository
                    .findBySessionIdAndPlayerId(session.getId(), player.getId())
                    .orElseGet(() -> Attendance.builder().session(session).player(player).build());

            attendance.setStatus(mark.status());
            attendance.setNotes(mark.notes());
            attendance.setMarkedBy(currentUser);
            attendance.setMarkedAt(Instant.now());

            attendanceRepository.save(attendance);
            saved.add(attendance);
        }

        return saved.stream().map(AttendanceResponse::from).toList();
    }

    @Transactional
    public AttendanceResponse update(UUID id, AttendanceUpdateRequest request, User currentUser) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance record not found"));
        ensureCanManageSession(attendance.getSession(), currentUser);

        attendance.setStatus(request.status());
        attendance.setNotes(request.notes());
        attendance.setMarkedBy(currentUser);
        attendance.setMarkedAt(Instant.now());
        return AttendanceResponse.from(attendance);
    }

    @Transactional(readOnly = true)
    public PlayerAttendanceSummary getPlayerAttendance(UUID playerId, User currentUser) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new NotFoundException("Player not found"));
        if (currentUser.getRole() == Role.PARENT
                && !player.getParent().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only view your own children's attendance");
        }

        List<Attendance> records = attendanceRepository.findByPlayerIdOrderBySessionDateDesc(playerId);

        int present = 0;
        int absent = 0;
        int late = 0;
        int excused = 0;
        for (Attendance a : records) {
            switch (a.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LATE -> late++;
                case EXCUSED -> excused++;
            }
        }
        int total = records.size();
        double rate = total == 0 ? 0.0 : (present * 100.0) / total;

        return new PlayerAttendanceSummary(
                playerId,
                total,
                present,
                absent,
                late,
                excused,
                Math.round(rate * 10) / 10.0,
                records.stream().map(AttendanceResponse::from).toList());
    }

    private void ensureCanManageSession(TrainingSession session, User currentUser) {
        if (currentUser.getRole() == Role.PARENT) {
            throw new AccessDeniedException("Parents do not have access to session attendance management");
        }
        if (currentUser.getRole() == Role.COACH
                && !session.getCoach().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only manage attendance for your own sessions");
        }
    }

    private TrainingSession findSessionOrThrow(UUID id) {
        return sessionRepository.findById(id).orElseThrow(() -> new NotFoundException("Session not found"));
    }
}
