package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewSessionDto {
    private Long id;
    private String mode;
    private List<InterviewMessageDto> messages;
    private Instant createdAt;
    private Instant updatedAt;
}