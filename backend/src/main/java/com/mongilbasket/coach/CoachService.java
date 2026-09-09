package com.mongilbasket.coach;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoachService {

    private final CoachRepository coachRepository;

    @Transactional(readOnly = true)
    public List<CoachResponse> list() {
        return coachRepository.findAll().stream().map(CoachResponse::from).toList();
    }
}
