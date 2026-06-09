package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class GoalRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private Double targetValue;

    @NotNull
    @FutureOrPresent
    private Instant deadline;
}
