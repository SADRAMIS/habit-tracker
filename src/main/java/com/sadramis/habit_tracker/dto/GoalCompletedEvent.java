package com.sadramis.habit_tracker.dto;

import lombok.Data;

@Data
public class GoalCompletedEvent {

    private Long goalId;
    private Long userId;
    private String message;

    public GoalCompletedEvent() {}

    public GoalCompletedEvent(Long goalId, Long userId, String message) {
        this.goalId = goalId;
        this.userId = userId;
        this.message = message;
    }
}
