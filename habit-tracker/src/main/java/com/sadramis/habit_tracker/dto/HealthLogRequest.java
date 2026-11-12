package com.sadramis.habit_tracker.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HealthLogRequest {
    private LocalDate logDate;
    private Integer steps;
    private Integer sleepHours;
    private Integer sleepMinutes;
    private Integer calories;
    private Integer proteinGrams;
    private Integer fiberGrams;
    private Integer fruitsVegGrams;
    private Integer strengthWorkouts;
    private Integer cardioMinutes;
}