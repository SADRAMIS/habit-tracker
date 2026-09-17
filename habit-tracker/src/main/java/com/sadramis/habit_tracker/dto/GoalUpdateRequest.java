package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.Instant;

@Data
public class GoalUpdateRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private Double targetValue;

    @NotNull
    private Instant deadline;
}