package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@AllArgsConstructor
@Getter
public class GoalDto {
    private Long id;
    private String title;
    private String description;
    private Double targetValue;
    private Instant deadline;
    private String status;
    private Double currentValue;
    private Instant createdAt;
}
