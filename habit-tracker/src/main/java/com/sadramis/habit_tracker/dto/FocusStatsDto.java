package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FocusStatsDto {
    private int totalSessions;
    private long totalSeconds;
    private int todaySessions;
    private long todaySeconds;

    // Распределение по часам (0-23)
    private List<HourlyStat> hourlyDistribution;

    // Распределение по дням (за последние 7 дней)
    private List<DailyStat> weeklyDistribution;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HourlyStat {
        private int hour;
        private long seconds;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyStat {
        private String day; // "Mon", "Tue", ...
        private long seconds;
    }
}