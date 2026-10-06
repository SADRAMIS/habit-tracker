package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeynmanStreakDto {
    private int currentStreak;
    private int longestStreak;
    private int totalEntries;
    private boolean wroteToday;
}