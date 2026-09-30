package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.MemoryCardDto;
import com.sadramis.habit_tracker.dto.MemoryCardRequest;
import com.sadramis.habit_tracker.dto.ReviewRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.MemoryCardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
public class MemoryCardController {

    private final MemoryCardService cardService;
    private final UserRepository userRepository;

    public MemoryCardController(MemoryCardService cardService, UserRepository userRepository) {
        this.cardService = cardService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<MemoryCardDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(cardService.getAll(currentUserId(auth)));
    }

    @GetMapping("/due")
    public ResponseEntity<List<MemoryCardDto>> getDue(Authentication auth) {
        return ResponseEntity.ok(cardService.getDue(currentUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<MemoryCardDto> create(@Valid @RequestBody MemoryCardRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(currentUserId(auth), req));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<MemoryCardDto> review(@PathVariable Long id, @Valid @RequestBody ReviewRequest req, Authentication auth) {
        return ResponseEntity.ok(cardService.review(currentUserId(auth), id, req.getQuality()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        cardService.delete(currentUserId(auth), id);
        return ResponseEntity.noContent().build();
    }
}