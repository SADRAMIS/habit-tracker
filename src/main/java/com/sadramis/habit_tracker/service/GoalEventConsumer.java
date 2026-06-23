package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.event.GoalAchievedEvent;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class GoalEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(GoalEventConsumer.class);
    private final ObjectMapper objectMapper;

    public GoalEventConsumer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "goal-events", groupId = "habit-tracker-group")
    public void listen(ConsumerRecord<String, String> record) {
        try {
            GoalAchievedEvent event = objectMapper.readValue(record.value(), GoalAchievedEvent.class);
            log.info("Получено событие: пользователь {} достиг цели {} — {}",
                    event.getUserId(), event.getGoalId(), event.getMessage());
        } catch (Exception e) {
            log.error("Ошибка обработки сообщения: {}", e.getMessage());
            throw new RuntimeException("Временная ошибка", e);
        }
    }
}