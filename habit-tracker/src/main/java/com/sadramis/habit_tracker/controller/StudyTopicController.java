package com.sadramis.habit_tracker.controller;

import com.sadramis.habit_tracker.dto.StudyTopicDto;
import com.sadramis.habit_tracker.service.StudyTopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/study")
public class StudyTopicController {

    private final StudyTopicService service;

    public StudyTopicController(StudyTopicService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StudyTopicDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/modules")
    public ResponseEntity<List<String>> getModules() {
        return ResponseEntity.ok(service.getModules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyTopicDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
}