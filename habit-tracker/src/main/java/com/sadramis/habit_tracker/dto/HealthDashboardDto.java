package com.sadramis.habit_tracker.dto;
import lombok.Data;
import java.util.List;

@Data
public class HealthDashboardDto {
    private int currentLifeExpectancy;
    private int potentialLifeExpectancy;
    private int yearsDifference; // разница (потенциал - текущая)

    private double avgSteps;
    private double avgSleepHours;
    private double avgProtein;
    private double avgFiber;
    private double avgFruitsVeg;

    private List<DailyStat> trend;

    @Data
    public static class DailyStat {
        public String date;
        public double steps;
        public double protein;
    }
}