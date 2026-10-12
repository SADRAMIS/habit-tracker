package com.sadramis.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HabitRequest {
    @NotBlank
    private String title;
    private String description;
    private String icon;
    private String color;
    private String frequency = "daily";
    private Integer targetPerDay = 1;
}