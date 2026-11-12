package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "daily_health_logs", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "log_date"}))
@Getter
@Setter
@NoArgsConstructor
public class DailyHealthLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    private Integer steps = 0;
    private Integer sleepHours = 0;
    private Integer sleepMinutes = 0;
    private Integer calories = 0;
    private Integer proteinGrams = 0;
    private Integer fiberGrams = 0;
    private Integer fruitsVegGrams = 0;
    private Integer strengthWorkouts = 0;
    private Integer cardioMinutes = 0;
}