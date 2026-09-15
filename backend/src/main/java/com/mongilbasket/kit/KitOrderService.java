package com.mongilbasket.kit;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.payment.PaymentStatus;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KitOrderService {

    private final KitOrderRepository kitOrderRepository;
    private final PlayerRepository playerRepository;

    @Transactional
    public KitOrderResponse create(KitOrderCreateRequest request, User currentUser) {
        Player player = playerRepository.findById(request.playerId())
                .orElseThrow(() -> new NotFoundException("Player not found"));

        KitOrder order = KitOrder.builder()
                .player(player)
                .size(request.size())
                .amount(request.amount())
                .paymentStatus(request.paymentStatus())
                .paymentDate(request.paymentDate())
                .method(request.method())
                .reference(request.reference())
                .notes(request.notes())
                .orderedBy(currentUser)
                .build();

        return KitOrderResponse.from(kitOrderRepository.save(order));
    }

    @Transactional
    public KitOrderResponse update(UUID id, KitOrderUpdateRequest request) {
        KitOrder order = findByIdOrThrow(id);
        order.setSize(request.size());
        order.setAmount(request.amount());
        order.setPaymentStatus(request.paymentStatus());
        order.setPaymentDate(request.paymentDate());
        order.setMethod(request.method());
        order.setReference(request.reference());
        order.setNotes(request.notes());
        return KitOrderResponse.from(order);
    }

    @Transactional
    public KitOrderResponse updateStatus(UUID id, KitOrderStatusUpdateRequest request) {
        KitOrder order = findByIdOrThrow(id);
        order.setStatus(request.status());
        return KitOrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<KitOrderResponse> list(KitOrderStatus status, PaymentStatus paymentStatus, UUID playerId) {
        List<Specification<KitOrder>> filters = Stream.of(
                        KitOrderSpecifications.statusEquals(status),
                        KitOrderSpecifications.paymentStatusEquals(paymentStatus),
                        KitOrderSpecifications.playerIdEquals(playerId))
                .filter(Objects::nonNull)
                .toList();

        return kitOrderRepository.findAll(Specification.allOf(filters)).stream()
                .map(KitOrderResponse::from)
                .toList();
    }

    private KitOrder findByIdOrThrow(UUID id) {
        return kitOrderRepository.findById(id).orElseThrow(() -> new NotFoundException("Kit order not found"));
    }
}
