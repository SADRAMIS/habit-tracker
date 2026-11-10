package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookRequest {
    @NotBlank
    private String title;

    private String author;
    private String genre;
    private Integer totalPages = 0;
    private String notes;
}