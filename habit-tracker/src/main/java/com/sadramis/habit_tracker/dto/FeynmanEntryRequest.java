package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeynmanEntryRequest {
    @NotNull
    private Long topicId;

    @NotBlank
    private String explanation;
}