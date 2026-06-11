package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.ProgressRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.Progress;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.ProgressRepository;
import org.springframework.stereotype.Service;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final GoalRepository goalRepository;

    public ProgressService(ProgressRepository progressRepository, GoalRepository goalRepository) {
        this.progressRepository = progressRepository;
        this.goalRepository = goalRepository;
    }

    public void addProgress(ProgressRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUser_Id(request.getGoalId(), userId)
                .orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));

        Progress progress = new Progress();
        progress.setGoal(goal);
        progress.setValue(request.getValue());
        progress.setDate(request.getDate());

        progressRepository.save(progress);
    }
}
