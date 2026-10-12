package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "habits", indexes = @Index(columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String description;

    /** Эмодзи-иконка (например, 💧, 🏃, 📚) */
    private String icon;

    /** Цвет в hex (например, #3b82f6) */
    private String color;

    /** daily | weekly | custom */
    @Column(nullable = false)
    private String frequency = "daily";

    /** Целевое количество раз в день (например, 8 стаканов воды) */
    @Column(nullable = false)
    private Integer targetPerDay = 1;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (icon == null) icon = "✅";
        if (color == null) color = "#3b82f6";
    }
}