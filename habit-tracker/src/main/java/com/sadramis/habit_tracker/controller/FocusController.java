package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.FocusSessionRequest;
import com.sadramis.habit_tracker.dto.FocusStatsDto;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.FocusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/focus")
public class FocusController {

    private final FocusService focusService;
    private final UserRepository userRepository;

    public FocusController(FocusService focusService, UserRepository userRepository) {
        this.focusService = focusService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Void> createSession(@Valid @RequestBody FocusSessionRequest req, Authentication auth) {
        focusService.createSession(currentUserId(auth), req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/stats")
    public ResponseEntity<FocusStatsDto> getStats(Authentication auth) {
        return ResponseEntity.ok(focusService.getStats(currentUserId(auth)));
    }
}