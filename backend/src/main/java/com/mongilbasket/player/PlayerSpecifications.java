package com.mongilbasket.player;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

final class PlayerSpecifications {

    private PlayerSpecifications() {
    }

    static Specification<Player> statusEquals(PlayerStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Player> genderEquals(Gender gender) {
        if (gender == null) return null;
        return (root, query, cb) -> cb.equal(root.get("gender"), gender);
    }

    static Specification<Player> currentGroupIdEquals(UUID groupId) {
        if (groupId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("currentGroup").get("id"), groupId);
    }

    static Specification<Player> coachIdEquals(UUID coachId) {
        if (coachId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("currentGroup").get("coach").get("id"), coachId);
    }

    static Specification<Player> nameContains(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("firstName")), pattern),
                cb.like(cb.lower(root.get("lastName")), pattern));
    }
}
