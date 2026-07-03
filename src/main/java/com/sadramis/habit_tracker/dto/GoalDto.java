package com.sadramis.habit_tracker.dto;

import lombok.*;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
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
