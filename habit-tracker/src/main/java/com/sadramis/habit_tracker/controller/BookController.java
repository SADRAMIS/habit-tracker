package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.BookDto;
import com.sadramis.habit_tracker.dto.BookRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final BookService bookService;
    private final UserRepository userRepository;

    public BookController(BookService bookService, UserRepository userRepository) {
        this.bookService = bookService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<BookDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(bookService.getAll(currentUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<BookDto> create(@Valid @RequestBody BookRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookService.create(currentUserId(auth), req));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<BookDto> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            Authentication auth) {
        int currentPage = body.getOrDefault("currentPage", 0);
        return ResponseEntity.ok(bookService.updateProgress(currentUserId(auth), id, currentPage));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String status = body.getOrDefault("status", "READING");
        return ResponseEntity.ok(bookService.updateStatus(currentUserId(auth), id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        bookService.delete(currentUserId(auth), id);
        return ResponseEntity.noContent().build();
    }
}