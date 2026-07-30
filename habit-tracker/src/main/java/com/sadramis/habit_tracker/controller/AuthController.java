package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.LoginRequest;
import com.sadramis.habit_tracker.dto.RegistrationRequest;
import com.sadramis.habit_tracker.dto.UserDto;
import com.sadramis.habit_tracker.service.UserService;
import com.sadramis.habit_tracker.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("users/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegistrationRequest request) {
        UserDto userDto = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authToken);
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String token = jwtUtil.generateToken(request.getEmail(), role);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
