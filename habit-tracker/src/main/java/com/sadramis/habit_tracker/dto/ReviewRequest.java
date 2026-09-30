package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    @Min(0)
    @Max(5)
    private Integer quality; // 0..5 (SM-2)
}