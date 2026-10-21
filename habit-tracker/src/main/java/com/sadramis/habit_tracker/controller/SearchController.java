package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.SearchResultDto;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService service;
    private final UserRepository userRepository;

    public SearchController(SearchService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<SearchResultDto>> search(
            @RequestParam("q") String query,
            Authentication auth
    ) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return ResponseEntity.ok(service.search(user.getId(), query));
    }
}