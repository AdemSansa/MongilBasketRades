package com.mongilbasket.payment;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.group.GroupStatus;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;

import lombok.RequiredArgsConstructor;

/** Cross-references every ACTIVE player against this month's MEMBERSHIP payment records, so admins can see who hasn't paid rather than only who has a recorded payment. */
@Service
@RequiredArgsConstructor
public class PaymentStatusReportService {

    private final PlayerRepository playerRepository;
    private final GroupRepository groupRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public MonthlyPaymentStatusResponse build(int year, int month, UUID coachId) {
        if (month < 1 || month > 12) {
            throw new BadRequestException("month must be between 1 and 12");
        }
        String period = "%04d-%02d".formatted(year, month);

        List<Player> players = coachId != null
                ? groupRepository.findByCoachIdAndStatus(coachId, GroupStatus.ACTIVE).stream()
                        .flatMap(g -> playerRepository.findByCurrentGroupIdAndStatus(g.getId(), PlayerStatus.ACTIVE)
                                .stream())
                        .toList()
                : playerRepository.findByStatus(PlayerStatus.ACTIVE);

        Map<UUID, Payment> paymentsByPlayerId = paymentRepository.findByPeriodAndType(period, PaymentType.MEMBERSHIP)
                .stream()
                .collect(java.util.stream.Collectors.toMap(p -> p.getPlayer().getId(), Function.identity()));

        List<PlayerPaymentStatusRow> rows = players.stream()
                .map(p -> toRow(p, paymentsByPlayerId.get(p.getId())))
                .toList();

        return new MonthlyPaymentStatusResponse(year, month, period, rows);
    }

    private PlayerPaymentStatusRow toRow(Player player, Payment payment) {
        Group group = player.getCurrentGroup();
        String groupName = group != null ? group.getName() : "—";
        String coachName = group != null && group.getCoach() != null
                ? group.getCoach().getUser().getFirstName() + " " + group.getCoach().getUser().getLastName()
                : "—";

        return new PlayerPaymentStatusRow(
                player.getId(),
                player.getFirstName() + " " + player.getLastName(),
                groupName,
                coachName,
                payment != null ? payment.getStatus() : null,
                payment != null ? payment.getAmount() : null,
                payment != null ? payment.getPaymentDate() : null);
    }
}
