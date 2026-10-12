package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.HabitDto;
import com.sadramis.habit_tracker.dto.HabitRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.Habit;
import com.sadramis.habit_tracker.model.HabitCompletion;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.HabitCompletionRepository;
import com.sadramis.habit_tracker.repository.HabitRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final UserRepository userRepo;

    public HabitService(HabitRepository habitRepo,
                        HabitCompletionRepository completionRepo,
                        UserRepository userRepo) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public HabitDto create(Long userId, HabitRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setTitle(req.getTitle());
        habit.setDescription(req.getDescription());
        habit.setIcon(req.getIcon());
        habit.setColor(req.getColor());
        habit.setFrequency(req.getFrequency());
        habit.setTargetPerDay(req.getTargetPerDay());
        Habit saved = habitRepo.save(habit);
        return toDto(saved, false);
    }

    @Transactional(readOnly = true)
    public List<HabitDto> getAll(Long userId) {
        return habitRepo.findAllByUser_IdOrderByCreatedAtAsc(userId)
                .stream().map(h -> toDto(h, false)).toList();
    }

    @Transactional
    public HabitDto toggleToday(Long userId, Long habitId) {
        Habit habit = habitRepo.findByIdAndUser_Id(habitId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Привычка не найдена"));

        LocalDate today = LocalDate.now();
        Optional<HabitCompletion> existing = completionRepo.findByHabit_IdAndDate(habitId, today);

        if (existing.isPresent()) {
            completionRepo.delete(existing.get());
        } else {
            HabitCompletion c = new HabitCompletion();
            c.setHabit(habit);
            c.setDate(today);
            c.setCount(habit.getTargetPerDay());
            completionRepo.save(c);
        }

        return toDto(habit, true);
    }

    @Transactional
    public HabitDto increment(Long userId, Long habitId) {
        Habit habit = habitRepo.findByIdAndUser_Id(habitId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Привычка не найдена"));

        LocalDate today = LocalDate.now();
        HabitCompletion c = completionRepo.findByHabit_IdAndDate(habitId, today).orElse(null);

        if (c == null) {
            c = new HabitCompletion();
            c.setHabit(habit);
            c.setDate(today);
            c.setCount(1);
        } else {
            c.setCount(c.getCount() + 1);
        }
        completionRepo.save(c);
        return toDto(habit, true);
    }

    @Transactional
    public void delete(Long userId, Long habitId) {
        Habit habit = habitRepo.findByIdAndUser_Id(habitId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Привычка не найдена"));
        habitRepo.delete(habit);
    }

    private HabitDto toDto(Habit habit, boolean withStats) {
        HabitDto dto = new HabitDto();
        dto.setId(habit.getId());
        dto.setTitle(habit.getTitle());
        dto.setDescription(habit.getDescription());
        dto.setIcon(habit.getIcon());
        dto.setColor(habit.getColor());
        dto.setFrequency(habit.getFrequency());
        dto.setTargetPerDay(habit.getTargetPerDay());
        dto.setCreatedAt(habit.getCreatedAt());

        List<HabitCompletion> completions =
                completionRepo.findAllByHabit_IdOrderByDateDesc(habit.getId());

        LocalDate today = LocalDate.now();
        dto.setDoneToday(completions.stream().anyMatch(c -> c.getDate().equals(today)));
        dto.setTodayCount(completions.stream()
                .filter(c -> c.getDate().equals(today))
                .mapToInt(HabitCompletion::getCount)
                .findFirst().orElse(0));
        dto.setTotalCompletions(completions.size());

        // Recent 30 days
        LocalDate from = today.minusDays(30);
        List<LocalDate> recent = completions.stream()
                .map(HabitCompletion::getDate)
                .filter(d -> !d.isBefore(from))
                .sorted()
                .collect(Collectors.toList());
        dto.setRecentDates(recent);

        // Streaks
        Set<LocalDate> dates = completions.stream()
                .map(HabitCompletion::getDate)
                .collect(Collectors.toSet());

        int current = 0;
        LocalDate check = today;
        if (!dates.contains(today)) check = today.minusDays(1);
        while (dates.contains(check)) {
            current++;
            check = check.minusDays(1);
        }
        dto.setCurrentStreak(current);

        // Longest streak
        List<LocalDate> sortedAsc = new ArrayList<>(dates);
        Collections.sort(sortedAsc);
        int longest = 0, run = 0;
        LocalDate prev = null;
        for (LocalDate d : sortedAsc) {
            if (prev != null && d.equals(prev.plusDays(1))) run++;
            else run = 1;
            longest = Math.max(longest, run);
            prev = d;
        }
        dto.setLongestStreak(longest);

        return dto;
    }
}