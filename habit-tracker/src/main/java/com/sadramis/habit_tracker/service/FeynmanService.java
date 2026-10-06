package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.FeynmanEntryDto;
import com.sadramis.habit_tracker.dto.FeynmanEntryRequest;
import com.sadramis.habit_tracker.dto.FeynmanStreakDto;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.FeynmanEntry;
import com.sadramis.habit_tracker.model.StudyTopic;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.FeynmanEntryRepository;
import com.sadramis.habit_tracker.repository.StudyTopicRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeynmanService {

    private final FeynmanEntryRepository entryRepo;
    private final StudyTopicRepository topicRepo;
    private final UserRepository userRepo;

    public FeynmanService(FeynmanEntryRepository entryRepo,
                          StudyTopicRepository topicRepo,
                          UserRepository userRepo) {
        this.entryRepo = entryRepo;
        this.topicRepo = topicRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public FeynmanEntryDto create(Long userId, FeynmanEntryRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));
        StudyTopic topic = topicRepo.findById(req.getTopicId())
                .orElseThrow(() -> new GoalNotFoundException("Тема не найдена"));

        FeynmanEntry entry = new FeynmanEntry();
        entry.setUser(user);
        entry.setTopicId(topic.getId());
        entry.setTopicTitle(topic.getTitle());
        entry.setExplanation(req.getExplanation());
        FeynmanEntry saved = entryRepo.save(entry);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<FeynmanEntryDto> getAll(Long userId) {
        return entryRepo.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<FeynmanEntryDto> getByTopic(Long userId, Long topicId) {
        return entryRepo.findAllByUser_IdAndTopicIdOrderByCreatedAtDesc(userId, topicId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public FeynmanStreakDto getStreak(Long userId) {
        List<FeynmanEntry> entries = entryRepo.findAllByUser_IdOrderByCreatedAtDesc(userId);
        if (entries.isEmpty()) {
            return new FeynmanStreakDto(0, 0, 0, false);
        }

        // Уникальные даты (LocalDate) — только по одной записи в день для стрика
        Set<LocalDate> uniqueDates = entries.stream()
                .map(e -> e.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));

        List<LocalDate> sortedDesc = new ArrayList<>(uniqueDates);
        Collections.reverse(sortedDesc);

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        boolean wroteToday = uniqueDates.contains(today);

        // Текущий стрик
        int currentStreak = 0;
        LocalDate expected = wroteToday ? today : (uniqueDates.contains(yesterday) ? yesterday : null);
        if (expected != null) {
            for (LocalDate d : sortedDesc) {
                if (d.equals(expected)) {
                    currentStreak++;
                    expected = expected.minusDays(1);
                } else if (d.isBefore(expected)) {
                    break;
                }
            }
        }

        // Самый длинный стрик
        int longest = 0;
        int run = 1;
        List<LocalDate> asc = new ArrayList<>(uniqueDates);
        for (int i = 1; i < asc.size(); i++) {
            if (asc.get(i).equals(asc.get(i - 1).plusDays(1))) {
                run++;
            } else {
                longest = Math.max(longest, run);
                run = 1;
            }
        }
        longest = Math.max(longest, run);

        return new FeynmanStreakDto(currentStreak, longest, entries.size(), wroteToday);
    }

    private FeynmanEntryDto toDto(FeynmanEntry e) {
        return new FeynmanEntryDto(
                e.getId(), e.getTopicId(), e.getTopicTitle(),
                e.getExplanation(), e.getCreatedAt()
        );
    }
}