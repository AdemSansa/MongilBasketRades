package com.mongilbasket.dashboard;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.attendance.Attendance;
import com.mongilbasket.attendance.AttendanceRepository;
import com.mongilbasket.attendance.AttendanceStatus;
import com.mongilbasket.coach.CoachRepository;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.parent.ParentRepository;
import com.mongilbasket.payment.PaymentRepository;
import com.mongilbasket.payment.PaymentStatus;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.registration.RegistrationRepository;
import com.mongilbasket.registration.RegistrationStatus;
import com.mongilbasket.session.SessionStatus;
import com.mongilbasket.session.TrainingSession;
import com.mongilbasket.session.TrainingSessionRepository;
import com.mongilbasket.session.TrainingSessionResponse;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<PaymentStatus> UNPAID_STATUSES = List.of(PaymentStatus.UNPAID, PaymentStatus.OVERDUE);

    private final PlayerRepository playerRepository;
    private final RegistrationRepository registrationRepository;
    private final CoachRepository coachRepository;
    private final TrainingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ParentRepository parentRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        LocalDate today = LocalDate.now();

        long totalPlayers = playerRepository.count();
        long activePlayers = playerRepository.countByStatus(PlayerStatus.ACTIVE);
        long pendingRegistrations = registrationRepository.countByStatus(RegistrationStatus.PENDING);
        long waitingList = registrationRepository.countByStatus(RegistrationStatus.WAITING_LIST);
        long activeCoaches = coachRepository.count();
        long unpaidFees = paymentRepository.countByStatusIn(UNPAID_STATUSES);

        List<TrainingSession> todaysSessions = sessionRepository.findByDateOrderByStartTimeAsc(today);
        long todaysSessionsCount = todaysSessions.size();
        long upcomingSessionsCount = sessionRepository.countByDateAfterAndStatus(today, SessionStatus.SCHEDULED);

        long presentCount = attendanceRepository.countByStatus(AttendanceStatus.PRESENT);
        long totalAttendanceRecords = attendanceRepository.count();
        double attendanceRate =
                totalAttendanceRecords == 0 ? 0.0 : Math.round(presentCount * 1000.0 / totalAttendanceRecords) / 10.0;

        return new AdminDashboardResponse(
                totalPlayers,
                activePlayers,
                pendingRegistrations,
                waitingList,
                activeCoaches,
                todaysSessionsCount,
                upcomingSessionsCount,
                unpaidFees,
                attendanceRate,
                todaysSessions.stream().map(TrainingSessionResponse::from).toList());
    }

    @Transactional(readOnly = true)
    public ParentDashboardResponse getParentDashboard(User currentUser) {
        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        List<Player> children = playerRepository.findByParentId(parent.getId());
        LocalDate today = LocalDate.now();

        List<ChildDashboardSummary> summaries = children.stream()
                .map(child -> {
                    String groupName = child.getCurrentGroup() != null ? child.getCurrentGroup().getName() : null;

                    TrainingSession nextTraining = child.getCurrentGroup() != null
                            ? sessionRepository
                                    .findFirstByGroupIdAndDateGreaterThanEqualAndStatusOrderByDateAscStartTimeAsc(
                                            child.getCurrentGroup().getId(), today, SessionStatus.SCHEDULED)
                                    .orElse(null)
                            : null;

                    Double attendanceRate = computeAttendanceRate(child.getId());
                    String paymentStatus = paymentRepository.findByPlayerIdOrderByPeriodDesc(child.getId()).stream()
                            .findFirst()
                            .map(p -> p.getStatus().name())
                            .orElse(null);

                    return new ChildDashboardSummary(
                            child.getId(),
                            child.getFirstName() + " " + child.getLastName(),
                            groupName,
                            nextTraining != null ? nextTraining.getDate() : null,
                            nextTraining != null ? nextTraining.getStartTime() : null,
                            attendanceRate,
                            paymentStatus);
                })
                .toList();

        return new ParentDashboardResponse(summaries);
    }

    private Double computeAttendanceRate(UUID playerId) {
        List<Attendance> records = attendanceRepository.findByPlayerIdOrderBySessionDateDesc(playerId);
        if (records.isEmpty()) return null;
        long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        return Math.round(present * 1000.0 / records.size()) / 10.0;
    }
}
