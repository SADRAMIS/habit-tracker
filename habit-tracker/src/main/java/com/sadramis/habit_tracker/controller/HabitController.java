package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.HabitDto;
import com.sadramis.habit_tracker.dto.HabitRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/habits")
public class HabitController {

    private final HabitService service;
    private final UserRepository userRepository;

    public HabitController(HabitService service, UserRepository userRepository) {
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
    public ResponseEntity<List<HabitDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(service.getAll(currentUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<HabitDto> create(@Valid @RequestBody HabitRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(currentUserId(auth), req));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<HabitDto> toggle(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.toggleToday(currentUserId(auth), id));
    }

    @PostMapping("/{id}/increment")
    public ResponseEntity<HabitDto> increment(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.increment(currentUserId(auth), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        service.delete(currentUserId(auth), id);
        return ResponseEntity.noContent().build();
    }
}