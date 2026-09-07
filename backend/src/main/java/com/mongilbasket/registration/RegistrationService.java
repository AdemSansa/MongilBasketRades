package com.mongilbasket.registration;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.parent.ParentRepository;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.season.Season;
import com.mongilbasket.season.SeasonRepository;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private static final List<RegistrationStatus> ACTIVE_REGISTRATION_STATUSES =
            List.of(RegistrationStatus.PENDING, RegistrationStatus.APPROVED, RegistrationStatus.WAITING_LIST);

    private final RegistrationRepository registrationRepository;
    private final PlayerRepository playerRepository;
    private final GroupRepository groupRepository;
    private final SeasonRepository seasonRepository;
    private final ParentRepository parentRepository;

    @Transactional
    public RegistrationResponse create(RegistrationCreateRequest request, User currentUser) {
        Player player = playerRepository.findById(request.playerId())
                .orElseThrow(() -> new NotFoundException("Player not found"));
        if (!player.getParent().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only register your own children");
        }

        Season activeSeason = seasonRepository.findByActiveTrue()
                .orElseThrow(() -> new BadRequestException("No active season is configured"));

        if (registrationRepository.existsByPlayerIdAndSeasonIdAndStatusIn(
                player.getId(), activeSeason.getId(), ACTIVE_REGISTRATION_STATUSES)) {
            throw new ConflictException(
                    "This player already has an active registration for the active season");
        }

        Group group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (!group.getSeason().getId().equals(activeSeason.getId())) {
            throw new BadRequestException("The selected group does not belong to the active season");
        }

        Registration registration = Registration.builder()
                .player(player)
                .parent(player.getParent())
                .season(activeSeason)
                .requestedGroup(group)
                .build();
        // saveAndFlush, not save: @CreationTimestamp populates registrationDate
        // only when the INSERT actually executes, which plain save() defers
        // until a later flush — reading it into the response beforehand
        // would return null.
        registrationRepository.saveAndFlush(registration);
        return RegistrationResponse.from(registration);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> list(RegistrationStatus status, UUID seasonId, UUID groupId) {
        return registrationRepository.search(status, seasonId, groupId).stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> myRegistrations(User currentUser) {
        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));
        return registrationRepository.findByParentId(parent.getId()).stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RegistrationResponse get(UUID id, User currentUser) {
        Registration registration = findByIdOrThrow(id);
        ensureCanAccess(registration, currentUser);
        return RegistrationResponse.from(registration);
    }

    /** If the requested group is at capacity, the registration lands on WAITING_LIST instead of APPROVED. */
    @Transactional
    public RegistrationResponse approve(UUID id, User admin) {
        Registration registration = findByIdOrThrow(id);
        ensurePending(registration);

        Group group = registration.getRequestedGroup();
        long currentCount = playerRepository.countByCurrentGroupIdAndStatus(group.getId(), PlayerStatus.ACTIVE);

        if (currentCount >= group.getCapacity()) {
            registration.setStatus(RegistrationStatus.WAITING_LIST);
        } else {
            registration.setStatus(RegistrationStatus.APPROVED);
            registration.getPlayer().setCurrentGroup(group);
        }
        registration.setReviewedBy(admin);
        registration.setReviewedAt(Instant.now());
        return RegistrationResponse.from(registration);
    }

    @Transactional
    public RegistrationResponse reject(UUID id, RegistrationRejectRequest request, User admin) {
        Registration registration = findByIdOrThrow(id);
        ensurePending(registration);

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setNotes(request.notes());
        registration.setReviewedBy(admin);
        registration.setReviewedAt(Instant.now());
        return RegistrationResponse.from(registration);
    }

    @Transactional
    public RegistrationResponse cancel(UUID id, User currentUser) {
        Registration registration = findByIdOrThrow(id);
        ensureCanAccess(registration, currentUser);
        ensurePending(registration);

        registration.setStatus(RegistrationStatus.CANCELLED);
        return RegistrationResponse.from(registration);
    }

    private void ensurePending(Registration registration) {
        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new BadRequestException("Only pending registrations can be reviewed or cancelled");
        }
    }

    private void ensureCanAccess(Registration registration, User currentUser) {
        if (currentUser.getRole() == Role.COACH) {
            throw new AccessDeniedException("Coaches do not have access to registrations");
        }
        if (currentUser.getRole() == Role.PARENT
                && !registration.getParent().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only access your own registrations");
        }
    }

    private Registration findByIdOrThrow(UUID id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Registration not found"));
    }
}
