package com.sadramis.habit_tracker.dto;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GoalDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String description;
    private Double targetValue;
    private Instant deadline;
    private String status;
    private Double currentValue;
    private Instant createdAt;
}
