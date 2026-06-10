package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.dto.GoalRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.ProgressRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoalService {
    private GoalRepository goalRepository;
    private ProgressRepository progressRepository;
    private UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, ProgressRepository progressRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public GoalDto createGoal(GoalRequest request, Long userId) {

        User user = userRepository.findById(userId).
                orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        Goal goal = new Goal();
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setDeadline(request.getDeadline());
        goal.setUser(user);
        Goal savedGoal = goalRepository.save(goal);

        GoalDto goalDto = new GoalDto(
                savedGoal.getId(),
                savedGoal.getTitle(),
                savedGoal.getDescription(),
                savedGoal.getTargetValue(),
                savedGoal.getDeadline(),
                "IN_PROGRESS",
                0.0,
                savedGoal.getCreatedAt()
        );
        return goalDto;
    }
    @Transactional(readOnly = true)
    public List<GoalDto> getUserGoals(Long userId) {
        List<Goal> goals = goalRepository.findByUser_Id(userId);
        List<GoalDto> dtos = new ArrayList<>();
        for (Goal goal : goals) {
            Double sum = progressRepository.sumValueByGoalId(goal.getId());
            if (sum == null) {
                sum = 0.0;
            }
            String status = determineStatus(goal, sum);
            GoalDto dto = new GoalDto(
                    goal.getId(),
                    goal.getTitle(),
                    goal.getDescription(),
                    goal.getTargetValue(),
                    goal.getDeadline(),
                    status,
                    sum,
                    goal.getCreatedAt()
            );
            dtos.add(dto);
        }
        return dtos;
    }
    @Transactional(readOnly = true)
    public GoalDto getGoalById(Long goalId, Long userId) {
        Goal goal = goalRepository.findByIdAndUser_Id(goalId, userId).
                orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));
        Double sum = progressRepository.sumValueByGoalId(goal.getId());
        if (sum == null) sum = 0.0;
        String status = determineStatus(goal, sum);
        GoalDto dto = new GoalDto(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getTargetValue(),
                goal.getDeadline(),
                status,
                sum,
                goal.getCreatedAt()
        );
        return dto;

    }

    private String determineStatus(Goal goal, Double currentValue) {
        if (currentValue >= goal.getTargetValue()) {
            return "COMPLETED";
        } else if (goal.getDeadline().isBefore(Instant.now())){
            return "EXPIRED";
        } else {
            return "IN_PROGRESS";
        }

    }
}
