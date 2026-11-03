package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendInterviewMessageRequest {
    @NotBlank
    private String content;
}