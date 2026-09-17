package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.dto.GoalRequest;
import com.sadramis.habit_tracker.dto.GoalUpdateRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.ExportService;
import com.sadramis.habit_tracker.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final UserRepository userRepository;
    private final GoalService goalService;
    private final ExportService exportService;

    public GoalController(UserRepository userRepository, GoalService goalService, ExportService exportService) {
        this.userRepository = userRepository;
        this.goalService = goalService;
        this.exportService = exportService;
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@Valid @RequestBody GoalRequest request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        Long userId = user.getId();
        GoalDto goalDto = goalService.createGoal(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(goalDto);
    }
    @GetMapping
    public ResponseEntity<List<GoalDto>> getUserGoals(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        List<GoalDto> goalDtos = goalService.getUserGoals(user.getId());
        return ResponseEntity.ok(goalDtos);

    }
    @GetMapping("/{goalId}")
    public ResponseEntity<GoalDto> getGoalById(@PathVariable Long goalId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        GoalDto goalDto = goalService.getGoalById(goalId, user.getId());
        return ResponseEntity.ok(goalDto);
    }
    @PostMapping("/{goalId}/complete")
    public ResponseEntity<Void> completeGoal(@PathVariable Long goalId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        goalService.markGoalCompleted(goalId, user.getId());

        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long goalId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        goalService.deleteGoal(goalId, user.getId());
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{goalId}")
    public ResponseEntity<GoalDto> updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalUpdateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        GoalDto updated = goalService.updateGoal(goalId, user.getId(), request);
        return ResponseEntity.ok(updated);
    }
}
