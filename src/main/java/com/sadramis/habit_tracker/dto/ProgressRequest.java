package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ProgressRequest {
    @NotNull
    private Long goalId;
    @NotNull
    @Positive
    private Double value;
    @NotNull
    @PastOrPresent
    private Instant date;
}
