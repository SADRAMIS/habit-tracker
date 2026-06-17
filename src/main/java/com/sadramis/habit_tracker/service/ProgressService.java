package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.ProgressRequest;
import com.sadramis.habit_tracker.event.GoalAchievedEvent;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.Progress;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.ProgressRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final GoalRepository goalRepository;
    private final KafkaTemplate<String, GoalAchievedEvent> kafkaTemplate;

    public ProgressService(ProgressRepository progressRepository, GoalRepository goalRepository, KafkaTemplate<String, GoalAchievedEvent> kafkaTemplate) {
        this.progressRepository = progressRepository;
        this.goalRepository = goalRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public void addProgress(ProgressRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUser_Id(request.getGoalId(), userId)
                .orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));

        Progress progress = new Progress();
        progress.setGoal(goal);
        progress.setProgressValue(request.getProgressValue());
        progress.setDate(request.getDate());

        progressRepository.save(progress);

        Double sum = progressRepository.sumValueByGoalId(goal.getId());
        if (sum == null) {
            sum = 0.0;
        }

        double previousSum = sum - request.getProgressValue();
        if (previousSum < goal.getTargetValue() && sum >= goal.getTargetValue()) {
            GoalAchievedEvent event = new GoalAchievedEvent(
                    goal.getId(),
                    userId,
                    "Поздравляем! Вы достигли цели \"" + goal.getTitle() + "\"",
                    Instant.now()
                    );
            kafkaTemplate.send("goal-events",goal.getId().toString(),event);
        }
    }
}
