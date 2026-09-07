package com.mongilbasket.season;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeasonService {

    private final SeasonRepository seasonRepository;

    @Transactional(readOnly = true)
    public List<SeasonResponse> list() {
        return seasonRepository.findAll().stream().map(SeasonResponse::from).toList();
    }

    @Transactional
    public SeasonResponse create(SeasonCreateRequest request) {
        if (seasonRepository.existsByName(request.name())) {
            throw new ConflictException("A season with this name already exists");
        }
        Season season = Season.builder()
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .active(false)
                .build();
        seasonRepository.save(season);
        return SeasonResponse.from(season);
    }

    @Transactional
    public SeasonResponse update(UUID id, SeasonUpdateRequest request) {
        Season season = findByIdOrThrow(id);
        season.setName(request.name());
        season.setStartDate(request.startDate());
        season.setEndDate(request.endDate());
        return SeasonResponse.from(season);
    }

    /** Activates this season and deactivates whichever season was previously active — only one active at a time. */
    @Transactional
    public SeasonResponse activate(UUID id) {
        Season season = findByIdOrThrow(id);
        seasonRepository.findByActiveTrue().ifPresent(current -> {
            if (!current.getId().equals(id)) {
                current.setActive(false);
            }
        });
        season.setActive(true);
        return SeasonResponse.from(season);
    }

    private Season findByIdOrThrow(UUID id) {
        return seasonRepository.findById(id).orElseThrow(() -> new NotFoundException("Season not found"));
    }
}
