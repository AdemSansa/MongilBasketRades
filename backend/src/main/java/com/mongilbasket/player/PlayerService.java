package com.mongilbasket.player;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.payment.PaymentRepository;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.parent.ParentRepository;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final ParentRepository parentRepository;
    private final GroupRepository groupRepository;
    private final PaymentRepository paymentRepository;

    /**
     * ADMIN and COACH only (enforced by @PreAuthorize on the controller).
     * Not yet scoped to "coach's own groups" — Group/currentGroup doesn't
     * exist until Phase 5, so every coach currently sees every player.
     */
    @Transactional(readOnly = true)
    public List<PlayerResponse> list(
            String search, PlayerStatus status, Gender gender, UUID groupId, UUID coachId) {
        List<Specification<Player>> filters = Stream.of(
                        PlayerSpecifications.nameContains(search),
                        PlayerSpecifications.statusEquals(status),
                        PlayerSpecifications.genderEquals(gender),
                        PlayerSpecifications.currentGroupIdEquals(groupId),
                        PlayerSpecifications.coachIdEquals(coachId))
                .filter(Objects::nonNull)
                .toList();

        return playerRepository.findAll(Specification.allOf(filters)).stream()
                .map(PlayerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlayerResponse get(UUID id, User currentUser) {
        Player player = findByIdOrThrow(id);
        ensureCanView(player, currentUser);
        return PlayerResponse.from(player);
    }

    @Transactional
    public PlayerResponse create(PlayerCreateRequest request, User currentUser) {
        Parent parent = resolveParentForCreate(request.parentId(), currentUser);

        Player player = Player.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .dateOfBirth(request.dateOfBirth())
                .gender(request.gender())
                .photoUrl(request.photoUrl())
                .medicalNotes(request.medicalNotes())
                .emergencyContactName(request.emergencyContactName())
                .emergencyContactPhone(request.emergencyContactPhone())
                .registrationDate(LocalDate.now())
                .parent(parent)
                .build();

        if (request.groupId() != null && currentUser.getRole() == Role.ADMIN) {
            Group group = groupRepository.findById(request.groupId())
                    .orElseThrow(() -> new NotFoundException("Group not found"));
            long currentCount = playerRepository.countByCurrentGroupIdAndStatus(group.getId(), PlayerStatus.ACTIVE);
            if (currentCount >= group.getCapacity()) {
                throw new ConflictException("This group is full (" + group.getCapacity() + " players)");
            }
            player.setCurrentGroup(group);
        }

        playerRepository.save(player);
        return PlayerResponse.from(player);
    }

    /** Links (or unlinks, with a null parentId) a parent account to a player, and keeps the payments' denormalized parent in sync. */
    @Transactional
    public PlayerResponse assignParent(UUID id, UUID parentId) {
        Player player = findByIdOrThrow(id);
        Parent parent = parentId == null
                ? null
                : parentRepository.findById(parentId).orElseThrow(() -> new NotFoundException("Parent not found"));
        player.setParent(parent);
        paymentRepository.findByPlayerIdOrderByPeriodDesc(id).forEach(payment -> payment.setParent(parent));
        return PlayerResponse.from(player);
    }

    @Transactional
    public PlayerResponse update(UUID id, PlayerUpdateRequest request, User currentUser) {
        Player player = findByIdOrThrow(id);
        ensureCanEdit(player, currentUser);

        player.setFirstName(request.firstName());
        player.setLastName(request.lastName());
        player.setDateOfBirth(request.dateOfBirth());
        player.setGender(request.gender());
        player.setPhotoUrl(request.photoUrl());
        player.setMedicalNotes(request.medicalNotes());
        player.setEmergencyContactName(request.emergencyContactName());
        player.setEmergencyContactPhone(request.emergencyContactPhone());

        return PlayerResponse.from(player);
    }

    @Transactional
    public PlayerResponse archive(UUID id) {
        Player player = findByIdOrThrow(id);
        player.setStatus(PlayerStatus.ARCHIVED);
        return PlayerResponse.from(player);
    }

    private Player findByIdOrThrow(UUID id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Player not found"));
    }

    private Parent resolveParentForCreate(UUID parentId, User currentUser) {
        if (currentUser.getRole() == Role.PARENT) {
            return parentRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new NotFoundException("Parent profile not found"));
        }
        if (parentId == null) {
            return null;
        }
        return parentRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Parent not found"));
    }

    private void ensureCanView(Player player, User currentUser) {
        if (currentUser.getRole() == Role.PARENT && !isOwner(player, currentUser)) {
            throw new AccessDeniedException("You can only view your own children");
        }
    }

    private void ensureCanEdit(Player player, User currentUser) {
        if (currentUser.getRole() == Role.PARENT && !isOwner(player, currentUser)) {
            throw new AccessDeniedException("You can only edit your own children");
        }
    }

    private boolean isOwner(Player player, User currentUser) {
        return player.getParent() != null && player.getParent().getUser().getId().equals(currentUser.getId());
    }
}
