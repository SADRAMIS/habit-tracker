package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.RegistrationRequest;
import com.sadramis.habit_tracker.dto.UserDto;
import com.sadramis.habit_tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegistrationRequest request) {
        UserDto userDto = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }
}
