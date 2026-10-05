package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "study_topics")
@Getter
@Setter
@NoArgsConstructor
public class StudyTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Например: "Модуль 1. Java Collections & JMM" */
    @Column(nullable = false)
    private String module;

    /** Например: "HashMap (Java 8+)" */
    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String summary;

    /** Полный текст теории (markdown / plain) */
    @Column(nullable = false, length = 20000)
    @Lob
    private String content;

    /** "Дворец памяти" — визуализация в ASCII / структурированном виде */
    @Column(nullable = false, length = 8000)
    @Lob
    private String visualization;

    /** Интересные факты, разделитель — \n---\n */
    @Column(length = 4000)
    @Lob
    private String facts;

    private String tags;

    private Integer orderIndex = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}