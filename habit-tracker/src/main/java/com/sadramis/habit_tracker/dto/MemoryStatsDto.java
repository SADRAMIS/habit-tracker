package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemoryStatsDto {
    private int totalCards;
    private int dueToday;
    private int matureCards;   // intervalDays >= 21
    private int youngCards;    // 1 <= intervalDays < 21
    private int newCards;      // repetitions == 0
    private double avgEaseFactor;
    private double avgIntervalDays;
    private int totalReviews;  // сумма repetitions

    // Кривая забывания — распределение по интервалам
    private List<IntervalBucket> intervalDistribution;

    // Топ-5 сложных карточек (низкий easeFactor)
    private List<HardCard> hardestCards;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class IntervalBucket {
        private String label;
        private int count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HardCard {
        private Long id;
        private String topic;
        private double easeFactor;
        private int repetitions;
        private int intervalDays;
    }
}