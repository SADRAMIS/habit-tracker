package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.FeynmanEntryDto;
import com.sadramis.habit_tracker.dto.FeynmanEntryRequest;
import com.sadramis.habit_tracker.dto.FeynmanStreakDto;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.FeynmanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feynman")
public class FeynmanController {

    private final FeynmanService service;
    private final UserRepository userRepository;

    public FeynmanController(FeynmanService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<FeynmanEntryDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(service.getAll(currentUserId(auth)));
    }

    @GetMapping("/by-topic/{topicId}")
    public ResponseEntity<List<FeynmanEntryDto>> getByTopic(@PathVariable Long topicId, Authentication auth) {
        return ResponseEntity.ok(service.getByTopic(currentUserId(auth), topicId));
    }

    @GetMapping("/streak")
    public ResponseEntity<FeynmanStreakDto> getStreak(Authentication auth) {
        return ResponseEntity.ok(service.getStreak(currentUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<FeynmanEntryDto> create(@Valid @RequestBody FeynmanEntryRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(currentUserId(auth), req));
    }
}