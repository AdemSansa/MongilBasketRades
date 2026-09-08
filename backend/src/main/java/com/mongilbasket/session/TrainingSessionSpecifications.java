package com.mongilbasket.session;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

final class TrainingSessionSpecifications {

    private TrainingSessionSpecifications() {
    }

    static Specification<TrainingSession> groupIdEquals(UUID groupId) {
        if (groupId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("group").get("id"), groupId);
    }

    static Specification<TrainingSession> coachIdEquals(UUID coachId) {
        if (coachId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("coach").get("id"), coachId);
    }

    static Specification<TrainingSession> dateEquals(LocalDate date) {
        if (date == null) return null;
        return (root, query, cb) -> cb.equal(root.get("date"), date);
    }
}
