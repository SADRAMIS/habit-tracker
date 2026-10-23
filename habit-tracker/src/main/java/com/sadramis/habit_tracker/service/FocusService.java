package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.FocusSessionRequest;
import com.sadramis.habit_tracker.dto.FocusStatsDto;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.FocusSession;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.FocusSessionRepository;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FocusService {

    private final FocusSessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final GoalRepository goalRepo;

    public FocusService(FocusSessionRepository sessionRepo, UserRepository userRepo, GoalRepository goalRepo) {
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
        this.goalRepo = goalRepo;
    }

    @Transactional
    public void createSession(Long userId, FocusSessionRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        FocusSession session = new FocusSession();
        session.setUser(user);
        session.setStartedAt(req.getStartedAt());
        session.setEndedAt(req.getEndedAt());
        session.setDurationSeconds(req.getDurationSeconds());
        session.setSessionType(req.getSessionType());

        if (req.getGoalId() != null) {
            Goal goal = goalRepo.findByIdAndUser_Id(req.getGoalId(), userId)
                    .orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));
            session.setGoal(goal);
        }

        sessionRepo.save(session);
    }

    @Transactional(readOnly = true)
    public FocusStatsDto getStats(Long userId) {
        List<FocusSession> all = sessionRepo.findAllByUser_IdOrderByStartedAtDesc(userId);

        // Отфильтровываем только рабочие сессии для статистики
        List<FocusSession> workSessions = all.stream()
                .filter(s -> "WORK".equals(s.getSessionType()))
                .toList();

        long totalSeconds = workSessions.stream().mapToLong(FocusSession::getDurationSeconds).sum();

        LocalDate today = LocalDate.now();
        List<FocusSession> todaySessions = workSessions.stream()
                .filter(s -> s.getStartedAt().atZone(ZoneId.systemDefault()).toLocalDate().equals(today))
                .toList();
        long todaySeconds = todaySessions.stream().mapToLong(FocusSession::getDurationSeconds).sum();

        // Распределение по часам (за всё время)
        Map<Integer, Long> hourMap = workSessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().atZone(ZoneId.systemDefault()).getHour(),
                        Collectors.summingLong(FocusSession::getDurationSeconds)
                ));
        List<FocusStatsDto.HourlyStat> hourly = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            hourly.add(new FocusStatsDto.HourlyStat(i, hourMap.getOrDefault(i, 0L)));
        }

        // Распределение по дням (последние 7 дней)
        LocalDate weekAgo = today.minusDays(6);
        Map<LocalDate, Long> dayMap = workSessions.stream()
                .filter(s -> {
                    LocalDate d = s.getStartedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                    return !d.isBefore(weekAgo) && !d.isAfter(today);
                })
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().atZone(ZoneId.systemDefault()).toLocalDate(),
                        Collectors.summingLong(FocusSession::getDurationSeconds)
                ));

        List<FocusStatsDto.DailyStat> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            weekly.add(new FocusStatsDto.DailyStat(dayName, dayMap.getOrDefault(d, 0L)));
        }

        return new FocusStatsDto(
                workSessions.size(),
                totalSeconds,
                todaySessions.size(),
                todaySeconds,
                hourly,
                weekly
        );
    }
}