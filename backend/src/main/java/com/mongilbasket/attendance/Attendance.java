package com.mongilbasket.attendance;

import java.time.Instant;
import java.util.UUID;

import com.mongilbasket.player.Player;
import com.mongilbasket.session.TrainingSession;
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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One mark per player per session — a real hard constraint (unlike Registration's, there's no legitimate reason for two marks of the same player in the same session), so a DB unique constraint is appropriate here. */
@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "player_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private TrainingSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "marked_by", nullable = false)
    private User markedBy;

    @Column(nullable = false)
    private Instant markedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
