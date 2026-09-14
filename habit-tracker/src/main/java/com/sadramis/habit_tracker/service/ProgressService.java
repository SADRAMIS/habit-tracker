package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalCompletedEvent;
import com.sadramis.habit_tracker.dto.ProgressDto;
import com.sadramis.habit_tracker.dto.ProgressRequest;

import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.Progress;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.ProgressRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final GoalRepository goalRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public ProgressService(ProgressRepository progressRepository, GoalRepository goalRepository, KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.progressRepository = progressRepository;
        this.goalRepository = goalRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @CacheEvict(value = "user_goals", key = "#userId") // ДОБАВЬ ЭТУ СТРОКУ
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
            GoalCompletedEvent event = new GoalCompletedEvent(goal.getId(), userId, "Поздравляем! Вы достигли цели");
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("goal-events", goal.getId().toString(), json);
        }
    }

    @Transactional(readOnly = true)
    public List<ProgressDto> getProgressHistory(Long goalId, Long userId) {
        // Проверяем, что цель принадлежит пользователю
        goalRepository.findByIdAndUser_Id(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));

        return progressRepository.findByGoal_IdOrderByDateDesc(goalId).stream()
                .map(p -> new ProgressDto(p.getId(), p.getProgressValue(), p.getDate()))
                .toList();
    }
}
