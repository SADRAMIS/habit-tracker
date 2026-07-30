package com.sadramis.habit_tracker.messaging;

import com.sadramis.habit_tracker.dto.GoalCompletedEvent;
import com.sadramis.habit_tracker.service.GoalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class GoalEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(GoalEventConsumer.class);
    private final GoalService goalService;
    private boolean simulateError = false;

    public GoalEventConsumer(GoalService goalService) {
        this.goalService = goalService;
    }

    public void setSimulateError(boolean simulateError) {
        this.simulateError = simulateError;
    }

    @KafkaListener(topics = "goal-events", groupId = "goal-event-group")
    public void handle(GoalCompletedEvent event) {
        log.info("Получено событие: {}", event);
        if (simulateError) {
            throw new RuntimeException("Имитация ошибки обработки");
        }
        goalService.markGoalCompleted(event.getGoalId(), event.getUserId());
        log.info("Сообщение успешно обработано");
    }
}
