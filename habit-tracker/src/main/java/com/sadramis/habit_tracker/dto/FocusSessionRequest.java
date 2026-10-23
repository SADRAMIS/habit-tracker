package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class FocusSessionRequest {
    private Long goalId;

    @NotNull
    private Instant startedAt;

    @NotNull
    private Instant endedAt;

    @NotNull
    @Min(1)
    private Integer durationSeconds;

    private String sessionType = "WORK";
}