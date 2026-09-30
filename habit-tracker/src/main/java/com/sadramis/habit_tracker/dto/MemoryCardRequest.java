package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MemoryCardRequest {
    @NotBlank
    private String topic;

    @NotBlank
    private String content;

    private String tags;
}