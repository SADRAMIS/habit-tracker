package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "feynman_entries", indexes = @Index(columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class FeynmanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** ID темы из study_topics */
    @Column(nullable = false)
    private Long topicId;

    /** Дублируем название темы для истории */
    @Column(nullable = false)
    private String topicTitle;

    /** Объяснение своими словами */
    @Column(nullable = false, length = 8000)
    @Lob
    private String explanation;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}