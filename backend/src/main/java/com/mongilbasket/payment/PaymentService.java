package com.mongilbasket.payment;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.parent.ParentRepository;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PlayerRepository playerRepository;
    private final ParentRepository parentRepository;

    @Transactional
    public PaymentResponse create(PaymentCreateRequest request, User currentUser) {
        validatePeriod(request.type(), request.period());

        Player player = playerRepository.findById(request.playerId())
                .orElseThrow(() -> new NotFoundException("Player not found"));

        if (paymentRepository
                .findByPlayerIdAndPeriodAndType(player.getId(), request.period(), request.type())
                .isPresent()) {
            throw new ConflictException(
                    "A payment record already exists for this player, period and type — use PUT to correct it");
        }

        Parent parent = player.getParent();

        Payment payment = Payment.builder()
                .player(player)
                .parent(parent)
                .amount(request.amount())
                .currency(request.currency() != null ? request.currency() : "TND")
                .type(request.type())
                .period(request.period())
                .paymentDate(request.paymentDate())
                .method(request.method())
                .status(request.status())
                .reference(request.reference())
                .recordedBy(currentUser)
                .notes(request.notes())
                .build();

        return PaymentResponse.from(paymentRepository.save(payment));
    }

    private void validatePeriod(PaymentType type, String period) {
        if (type == PaymentType.MEMBERSHIP && !period.matches("\\d{4}-\\d{2}")) {
            throw new BadRequestException("Membership period must be in YYYY-MM format");
        }
    }

    @Transactional
    public PaymentResponse update(UUID id, PaymentUpdateRequest request, User currentUser) {
        Payment payment = findByIdOrThrow(id);

        payment.setAmount(request.amount());
        payment.setPaymentDate(request.paymentDate());
        payment.setMethod(request.method());
        payment.setStatus(request.status());
        payment.setReference(request.reference());
        payment.setNotes(request.notes());
        payment.setRecordedBy(currentUser);

        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> list(PaymentStatus status, String period, UUID playerId, PaymentType type) {
        List<Specification<Payment>> filters = Stream.of(
                        PaymentSpecifications.statusEquals(status),
                        PaymentSpecifications.periodEquals(period),
                        PaymentSpecifications.playerIdEquals(playerId),
                        PaymentSpecifications.typeEquals(type))
                .filter(Objects::nonNull)
                .toList();

        return paymentRepository.findAll(Specification.allOf(filters)).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listForParent(User currentUser) {
        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));
        return paymentRepository.findByParentIdOrderByPeriodDesc(parent.getId()).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getForPlayer(UUID playerId, User currentUser) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new NotFoundException("Player not found"));

        boolean isOwner = player.getParent().getUser().getId().equals(currentUser.getId());
        if (!isOwner && !isAdmin(currentUser)) {
            throw new AccessDeniedException("You can only view your own children's payments");
        }

        return paymentRepository.findByPlayerIdOrderByPeriodDesc(playerId).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    private Payment findByIdOrThrow(UUID id) {
        return paymentRepository.findById(id).orElseThrow(() -> new NotFoundException("Payment not found"));
    }
}
