package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.model.CharacterStats;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.CharacterStatsRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CharacterService {
    private final CharacterStatsRepository statsRepo;
    private final UserRepository userRepo;

    public CharacterService(CharacterStatsRepository statsRepo, UserRepository userRepo) {
        this.statsRepo = statsRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public CharacterStats getOrCreateStats(Long userId) {
        return statsRepo.findByUser_Id(userId).orElseGet(() -> {
            User user = userRepo.findById(userId).orElseThrow();
            CharacterStats stats = new CharacterStats();
            stats.setUser(user);
            return statsRepo.save(stats);
        });
    }

    @Transactional
    public void addXp(Long userId, int amount, String attribute) {
        CharacterStats stats = getOrCreateStats(userId);
        stats.setXp(stats.getXp() + amount);

        // Логика повышения уровня (простая формула)
        int requiredXp = stats.getLevel() * 100;
        if (stats.getXp() >= requiredXp) {
            stats.setLevel(stats.getLevel() + 1);
            stats.setXp(stats.getXp() - requiredXp);
            // Бонусы за уровень
            stats.setHp(Math.min(100, stats.getHp() + 10));
            stats.setMp(Math.min(100, stats.getMp() + 10));
        }

        // Распределение по атрибутам
        switch (attribute.toLowerCase()) {
            case "strength" -> stats.setStrength(stats.getStrength() + (amount / 10));
            case "intelligence" -> stats.setIntelligence(stats.getIntelligence() + (amount / 10));
            case "wisdom" -> stats.setWisdom(stats.getWisdom() + (amount / 10));
        }

        statsRepo.save(stats);
    }
}