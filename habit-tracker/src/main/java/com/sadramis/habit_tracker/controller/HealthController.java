package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.HealthDashboardDto;
import com.sadramis.habit_tracker.dto.HealthLogRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final HealthService healthService;
    private final UserRepository userRepo;

    public HealthController(HealthService healthService, UserRepository userRepo) {
        this.healthService = healthService;
        this.userRepo = userRepo;
    }

    private Long getUserId(Authentication auth) {
        return userRepo.findByEmail(auth.getName()).orElseThrow(() -> new UserNotFoundException("User not found")).getId();
    }

    @PostMapping("/log")
    public ResponseEntity<Void> saveLog(@RequestBody HealthLogRequest req, Authentication auth) {
        healthService.saveLog(getUserId(auth), req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<HealthDashboardDto> getDashboard(Authentication auth) {
        return ResponseEntity.ok(healthService.getDashboard(getUserId(auth)));
    }
}