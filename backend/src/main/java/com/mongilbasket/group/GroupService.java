package com.mongilbasket.group;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.coach.Coach;
import com.mongilbasket.coach.CoachRepository;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.player.PlayerRepository;
import com.mongilbasket.player.PlayerStatus;
import com.mongilbasket.season.Season;
import com.mongilbasket.season.SeasonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final SeasonRepository seasonRepository;
    private final CoachRepository coachRepository;
    private final PlayerRepository playerRepository;

    @Transactional(readOnly = true)
    public List<GroupResponse> list(UUID seasonId, GroupStatus status) {
        return groupRepository.search(seasonId, status).stream()
                .map(group -> GroupResponse.from(group, currentCount(group.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse get(UUID id) {
        Group group = findByIdOrThrow(id);
        return GroupResponse.from(group, currentCount(id));
    }

    @Transactional
    public GroupResponse create(GroupCreateRequest request) {
        Season season = findSeasonOrThrow(request.seasonId());
        Coach coach = resolveCoach(request.coachId());

        Group group = Group.builder()
                .name(request.name())
                .season(season)
                .ageMin(request.ageMin())
                .ageMax(request.ageMax())
                .capacity(request.capacity())
                .coach(coach)
                .build();
        groupRepository.save(group);
        return GroupResponse.from(group, 0);
    }

    @Transactional
    public GroupResponse update(UUID id, GroupUpdateRequest request) {
        Group group = findByIdOrThrow(id);
        Season season = findSeasonOrThrow(request.seasonId());
        Coach coach = resolveCoach(request.coachId());

        group.setName(request.name());
        group.setSeason(season);
        group.setAgeMin(request.ageMin());
        group.setAgeMax(request.ageMax());
        group.setCapacity(request.capacity());
        group.setCoach(coach);

        return GroupResponse.from(group, currentCount(id));
    }

    @Transactional
    public GroupResponse setStatus(UUID id, GroupStatus status) {
        Group group = findByIdOrThrow(id);
        group.setStatus(status);
        return GroupResponse.from(group, currentCount(id));
    }

    private long currentCount(UUID groupId) {
        return playerRepository.countByCurrentGroupIdAndStatus(groupId, PlayerStatus.ACTIVE);
    }

    private Group findByIdOrThrow(UUID id) {
        return groupRepository.findById(id).orElseThrow(() -> new NotFoundException("Group not found"));
    }

    private Season findSeasonOrThrow(UUID seasonId) {
        return seasonRepository.findById(seasonId).orElseThrow(() -> new NotFoundException("Season not found"));
    }

    private Coach resolveCoach(UUID coachId) {
        if (coachId == null) return null;
        return coachRepository.findById(coachId).orElseThrow(() -> new NotFoundException("Coach not found"));
    }
}
