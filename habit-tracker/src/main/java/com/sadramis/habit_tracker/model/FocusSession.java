package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "focus_sessions", indexes = @Index(columnList = "user_id, started_at"))
@Getter
@Setter
@NoArgsConstructor
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @Column(nullable = false)
    private Instant startedAt;

    @Column(nullable = false)
    private Instant endedAt;

    /** Длительность в секундах */
    @Column(nullable = false)
    private Integer durationSeconds;

    /** WORK | BREAK */
    @Column(nullable = false)
    private String sessionType = "WORK";
}