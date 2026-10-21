package com.sadramis.habit_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchResultDto {
    /** GOAL | HABIT | CARD | TOPIC | FEYNMAN */
    private String type;
    private Long id;
    private String title;
    private String subtitle;
    private String url;
}