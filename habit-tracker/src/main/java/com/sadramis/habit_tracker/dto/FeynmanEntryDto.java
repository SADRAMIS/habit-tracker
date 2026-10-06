package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeynmanEntryDto {
    private Long id;
    private Long topicId;
    private String topicTitle;
    private String explanation;
    private Instant createdAt;
}