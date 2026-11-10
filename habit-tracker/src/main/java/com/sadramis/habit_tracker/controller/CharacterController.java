package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.CharacterStats;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.CharacterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/character")
public class CharacterController {
    private final CharacterService characterService;
    private final UserRepository userRepository;

    public CharacterController(CharacterService characterService, UserRepository userRepository) {
        this.characterService = characterService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<CharacterStats> getStats(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return ResponseEntity.ok(characterService.getOrCreateStats(user.getId()));
    }


    @PostMapping("/add-xp")
    public ResponseEntity<Void> addXp(@RequestParam int amount, @RequestParam String attribute, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        characterService.addXp(user.getId(), amount, attribute);
        return ResponseEntity.ok().build();
    }
}