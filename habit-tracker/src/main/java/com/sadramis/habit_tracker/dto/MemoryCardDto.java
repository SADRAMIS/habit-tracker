package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemoryCardDto {
    private Long id;
    private String topic;
    private String content;
    private String tags;
    private Instant nextReview;
    private Integer repetitions;
    private Double easeFactor;
    private Integer intervalDays;
    private Instant lastReviewedAt;
    private Instant createdAt;
    private Long goalId;
    private String goalTitle;
}