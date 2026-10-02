package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "memory_cards", indexes = @Index(columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class MemoryCard {

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
    private String topic;

    @Column(nullable = false, length = 4000)
    private String content;

    private String tags;

    // SM-2 поля
    @Column(nullable = false)
    private Instant nextReview;

    @Column(nullable = false)
    private Integer repetitions = 0;

    @Column(nullable = false)
    private Double easeFactor = 2.5;

    @Column(nullable = false)
    private Integer intervalDays = 0;

    private Instant lastReviewedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (nextReview == null) {
            nextReview = Instant.now();
        }
    }
}