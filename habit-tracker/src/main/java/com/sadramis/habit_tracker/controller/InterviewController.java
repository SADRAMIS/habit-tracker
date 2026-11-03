package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.*;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService service;
    private final UserRepository userRepository;

    public InterviewController(InterviewService service, UserRepository userRepository) {
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
    public ResponseEntity<List<InterviewSessionDto>> list(Authentication auth) {
        return ResponseEntity.ok(service.listAll(currentUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewSessionDto> getById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.getById(currentUserId(auth), id));
    }

    @PostMapping("/start")
    public ResponseEntity<InterviewSessionDto> start(
            @Valid @RequestBody StartInterviewRequest req,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.start(currentUserId(auth), req.getMode()));
    }

    @PostMapping("/{id}/message")
    public ResponseEntity<InterviewSessionDto> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SendInterviewMessageRequest req,
            Authentication auth
    ) {
        return ResponseEntity.ok(service.sendMessage(currentUserId(auth), id, req.getContent()));
    }
}