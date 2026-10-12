package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
        name = "habit_completions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"habit_id", "date"}),
        indexes = @Index(columnList = "habit_id, date")
)
@Getter
@Setter
@NoArgsConstructor
public class HabitCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(nullable = false)
    private LocalDate date;

    /** Сколько раз выполнено за день (для привычек с target > 1) */
    @Column(nullable = false)
    private Integer count = 1;
}