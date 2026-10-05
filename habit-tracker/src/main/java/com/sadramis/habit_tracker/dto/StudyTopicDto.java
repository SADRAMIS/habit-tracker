package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudyTopicDto {
    private Long id;
    private String module;
    private String title;
    private String summary;
    private String content;
    private String visualization;
    private String facts;
    private String tags;
    private Integer orderIndex;
    private Instant createdAt;
}