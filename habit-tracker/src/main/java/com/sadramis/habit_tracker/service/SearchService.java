package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.SearchResultDto;
import com.sadramis.habit_tracker.model.*;
import com.sadramis.habit_tracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SearchService {

    private final GoalRepository goalRepo;
    private final HabitRepository habitRepo;
    private final MemoryCardRepository cardRepo;
    private final StudyTopicRepository topicRepo;
    private final FeynmanEntryRepository feynmanRepo;

    public SearchService(GoalRepository goalRepo,
                         HabitRepository habitRepo,
                         MemoryCardRepository cardRepo,
                         StudyTopicRepository topicRepo,
                         FeynmanEntryRepository feynmanRepo) {
        this.goalRepo = goalRepo;
        this.habitRepo = habitRepo;
        this.cardRepo = cardRepo;
        this.topicRepo = topicRepo;
        this.feynmanRepo = feynmanRepo;
    }

    @Transactional(readOnly = true)
    public List<SearchResultDto> search(Long userId, String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        String q = query.trim();
        List<SearchResultDto> results = new ArrayList<>();

        // === Цели ===
        goalRepo.findByUser_IdAndTitleContainingIgnoreCase(userId, q).forEach(g ->
                results.add(new SearchResultDto(
                        "GOAL", g.getId(), g.getTitle(),
                        truncate(g.getDescription(), 60),
                        "/goals/" + g.getId()
                ))
        );

        // === Привычки ===
        habitRepo.findByUser_IdAndTitleContainingIgnoreCase(userId, q).forEach(h ->
                results.add(new SearchResultDto(
                        "HABIT", h.getId(), h.getTitle(),
                        truncate(h.getDescription(), 60),
                        "/habits"
                ))
        );

        // === Карточки (по теме + по содержимому) ===
        cardRepo.findByUser_IdAndTopicContainingIgnoreCase(userId, q).forEach(c ->
                results.add(new SearchResultDto(
                        "CARD", c.getId(), c.getTopic(),
                        truncate(c.getContent(), 60),
                        "/memorize"
                ))
        );

        // === Темы Study (глобальные, не user-scoped) ===
        topicRepo.findByTitleContainingIgnoreCase(q).forEach(t ->
                results.add(new SearchResultDto(
                        "TOPIC", t.getId(), t.getTitle(),
                        t.getModule() + " — " + truncate(t.getSummary(), 50),
                        "/study"
                ))
        );

        // === Фейнман (по теме + по тексту объяснения) ===
        feynmanRepo.findByUser_IdAndTopicTitleContainingIgnoreCase(userId, q).forEach(f ->
                results.add(new SearchResultDto(
                        "FEYNMAN", f.getId(), f.getTopicTitle(),
                        truncate(f.getExplanation(), 60),
                        "/feynman"
                ))
        );

        // Ограничиваем до 30 результатов
        return results.stream()
                .sorted(Comparator.comparing(SearchResultDto::getTitle))
                .limit(30)
                .toList();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}