package com.mongilbasket.registration;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.mongilbasket.group.Group;
import com.mongilbasket.parent.Parent;
import com.mongilbasket.player.Player;
import com.mongilbasket.season.Season;
import com.mongilbasket.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Multiple rows per player per season are allowed (e.g. re-registering
 * after a REJECTED or CANCELLED attempt) — only one *active*
 * (PENDING/APPROVED/WAITING_LIST) registration per player per season is
 * enforced, in RegistrationService, not as a DB constraint. Together they
 * still give the full historical trail (docs/database/entities.md §10).
 */
@Entity
@Table(name = "registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_group_id", nullable = false)
    private Group requestedGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant registrationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private Instant reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
