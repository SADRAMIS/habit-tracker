package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabitDto {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private String frequency;
    private Integer targetPerDay;
    private Instant createdAt;

    // Статистика
    private int currentStreak;
    private int longestStreak;
    private boolean doneToday;
    private int todayCount;
    private int totalCompletions;

    // Последние 30 дней (для heatmap) — даты, когда выполнено
    private List<LocalDate> recentDates;
}