package com.mongilbasket.report;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.attendance.Attendance;
import com.mongilbasket.attendance.AttendanceRepository;
import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.group.GroupStatus;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.session.TrainingSession;
import com.mongilbasket.session.TrainingSessionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MonthlyAttendanceReportService {

    private final GroupRepository groupRepository;
    private final TrainingSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final PlayerRepository playerRepository;

    @Transactional(readOnly = true)
    public MonthlyAttendanceReportResponse build(UUID coachId, int year, int month) {
        if (month < 1 || month > 12) {
            throw new BadRequestException("month must be between 1 and 12");
        }

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Group> groups = coachId != null
                ? groupRepository.findByCoachIdAndStatus(coachId, GroupStatus.ACTIVE)
                : groupRepository.search(null, GroupStatus.ACTIVE);

        List<GroupAttendanceReport> blocks =
                groups.stream().map(g -> buildGroupBlock(g, start, end)).toList();

        return new MonthlyAttendanceReportResponse(year, month, blocks);
    }

    private GroupAttendanceReport buildGroupBlock(Group group, LocalDate start, LocalDate end) {
        List<TrainingSession> sessions =
                sessionRepository.findByGroupIdAndDateBetweenOrderByDateAscStartTimeAsc(group.getId(), start, end);
        List<ReportSession> reportSessions =
                sessions.stream().map(s -> new ReportSession(s.getId(), s.getDate())).toList();

        List<Player> players = playerRepository.findByCurrentGroupIdAndStatus(group.getId(), PlayerStatus.ACTIVE);

        List<UUID> sessionIds = sessions.stream().map(TrainingSession::getId).toList();
        List<Attendance> attendance =
                sessionIds.isEmpty() ? List.of() : attendanceRepository.findBySessionIdIn(sessionIds);

        Map<UUID, Map<UUID, String>> marksByPlayer = new HashMap<>();
        for (Attendance a : attendance) {
            marksByPlayer
                    .computeIfAbsent(a.getPlayer().getId(), k -> new HashMap<>())
                    .put(a.getSession().getId(), a.getStatus().name());
        }

        int totalSessions = sessions.size();
        List<PlayerAttendanceRow> rows = players.stream()
                .map(p -> {
                    Map<UUID, String> marks = marksByPlayer.getOrDefault(p.getId(), Map.of());
                    int present = (int)
                            marks.values().stream().filter(s -> s.equals("PRESENT")).count();
                    double rate = totalSessions == 0 ? 0.0 : Math.round(present * 1000.0 / totalSessions) / 10.0;
                    return new PlayerAttendanceRow(
                            p.getId(),
                            p.getFirstName() + " " + p.getLastName(),
                            marks,
                            present,
                            totalSessions,
                            rate);
                })
                .toList();

        String coachName = group.getCoach() != null
                ? group.getCoach().getUser().getFirstName() + " " + group.getCoach().getUser().getLastName()
                : "—";

        return new GroupAttendanceReport(group.getId(), group.getName(), coachName, reportSessions, rows);
    }
}
