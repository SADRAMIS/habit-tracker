package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BulkImportRequest {
    @NotBlank
    private String text;

    // paragraphs | lines | colon
    private String splitBy = "paragraphs";

    private String tags;
}