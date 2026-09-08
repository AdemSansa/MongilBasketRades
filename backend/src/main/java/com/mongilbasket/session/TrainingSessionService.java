package com.mongilbasket.session;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.coach.Coach;
import com.mongilbasket.coach.CoachRepository;
import com.mongilbasket.common.BadRequestException;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.group.Group;
import com.mongilbasket.group.GroupRepository;
import com.mongilbasket.player.Player;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainingSessionService {

    private final TrainingSessionRepository sessionRepository;
    private final GroupRepository groupRepository;
    private final CoachRepository coachRepository;
    private final PlayerRepository playerRepository;

    /** A COACH is always scoped to their own sessions regardless of the coachId param — ADMIN/PARENT see whatever they ask for. */
    @Transactional(readOnly = true)
    public List<TrainingSessionResponse> list(UUID groupId, UUID coachId, LocalDate date, User currentUser) {
        UUID effectiveCoachId = coachId;
        if (currentUser.getRole() == Role.COACH) {
            effectiveCoachId = coachProfileOf(currentUser).getId();
        }
        return sessionRepository.search(groupId, effectiveCoachId, date).stream()
                .map(TrainingSessionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrainingSessionResponse> today(User currentUser) {
        return list(null, null, LocalDate.now(), currentUser);
    }

    @Transactional(readOnly = true)
    public TrainingSessionDetailResponse get(UUID id) {
        TrainingSession session = findByIdOrThrow(id);
        List<Player> roster =
                playerRepository.findByCurrentGroupIdAndStatus(session.getGroup().getId(), PlayerStatus.ACTIVE);
        return TrainingSessionDetailResponse.from(session, roster);
    }

    @Transactional
    public TrainingSessionResponse create(TrainingSessionCreateRequest request) {
        Group group = findGroupOrThrow(request.groupId());
        Coach coach = resolveCoach(request.coachId(), group);

        TrainingSession session = TrainingSession.builder()
                .group(group)
                .coach(coach)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .location(request.location())
                .notes(request.notes())
                .build();
        sessionRepository.save(session);
        return TrainingSessionResponse.from(session);
    }

    @Transactional
    public TrainingSessionResponse update(UUID id, TrainingSessionUpdateRequest request, User currentUser) {
        TrainingSession session = findByIdOrThrow(id);
        ensureCanManage(session, currentUser);

        Group group = findGroupOrThrow(request.groupId());
        session.setGroup(group);
        session.setCoach(resolveCoach(request.coachId(), group));
        session.setDate(request.date());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setLocation(request.location());
        session.setNotes(request.notes());
        return TrainingSessionResponse.from(session);
    }

    @Transactional
    public TrainingSessionResponse cancel(UUID id, User currentUser) {
        TrainingSession session = findByIdOrThrow(id);
        ensureCanManage(session, currentUser);
        session.setStatus(SessionStatus.CANCELLED);
        return TrainingSessionResponse.from(session);
    }

    @Transactional
    public TrainingSessionResponse complete(UUID id, User currentUser) {
        TrainingSession session = findByIdOrThrow(id);
        ensureCanManage(session, currentUser);
        session.setStatus(SessionStatus.COMPLETED);
        return TrainingSessionResponse.from(session);
    }

    private Coach resolveCoach(UUID coachId, Group group) {
        if (coachId != null) {
            return coachRepository.findById(coachId)
                    .orElseThrow(() -> new NotFoundException("Coach not found"));
        }
        if (group.getCoach() == null) {
            throw new BadRequestException("This group has no assigned coach; specify coachId explicitly");
        }
        return group.getCoach();
    }

    private Coach coachProfileOf(User user) {
        return coachRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Coach profile not found"));
    }

    private void ensureCanManage(TrainingSession session, User currentUser) {
        if (currentUser.getRole() == Role.COACH
                && !session.getCoach().getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only manage your own sessions");
        }
    }

    private Group findGroupOrThrow(UUID id) {
        return groupRepository.findById(id).orElseThrow(() -> new NotFoundException("Group not found"));
    }

    private TrainingSession findByIdOrThrow(UUID id) {
        return sessionRepository.findById(id).orElseThrow(() -> new NotFoundException("Session not found"));
    }
}
