package com.sadramis.habit_tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "character_stats")
@Getter
@Setter
@NoArgsConstructor
public class CharacterStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private int level = 1;
    private int xp = 0;
    private int hp = 100;
    private int mp = 100;

    // Атрибуты
    private int strength = 10;     // Дисциплина (привычки)
    private int intelligence = 10; // Обучение (книги, карточки)
    private int wisdom = 10;       // Мудрость (интервью, Фейнман)
}