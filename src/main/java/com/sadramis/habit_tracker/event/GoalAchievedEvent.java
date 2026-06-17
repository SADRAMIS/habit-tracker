package com.sadramis.habit_tracker.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GoalAchievedEvent {
    private Long goalId;
    private Long userId;
    private String message;
    private Instant timestamp;
}
