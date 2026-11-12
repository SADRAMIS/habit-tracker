package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.HealthDashboardDto;
import com.sadramis.habit_tracker.dto.HealthLogRequest;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.DailyHealthLog;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.DailyHealthLogRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HealthService {
    private final DailyHealthLogRepository logRepo;
    private final UserRepository userRepo;

    public HealthService(DailyHealthLogRepository logRepo, UserRepository userRepo) {
        this.logRepo = logRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void saveLog(Long userId, HealthLogRequest req) {
        User user = userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        LocalDate date = req.getLogDate() != null ? req.getLogDate() : LocalDate.now();

        DailyHealthLog log = logRepo.findByUser_IdAndLogDate(userId, date).orElse(new DailyHealthLog());
        log.setUser(user);
        log.setLogDate(date);
        log.setSteps(req.getSteps() != null ? req.getSteps() : log.getSteps());
        log.setSleepHours(req.getSleepHours() != null ? req.getSleepHours() : log.getSleepHours());
        log.setSleepMinutes(req.getSleepMinutes() != null ? req.getSleepMinutes() : log.getSleepMinutes());
        log.setCalories(req.getCalories() != null ? req.getCalories() : log.getCalories());
        log.setProteinGrams(req.getProteinGrams() != null ? req.getProteinGrams() : log.getProteinGrams());
        log.setFiberGrams(req.getFiberGrams() != null ? req.getFiberGrams() : log.getFiberGrams());
        log.setFruitsVegGrams(req.getFruitsVegGrams() != null ? req.getFruitsVegGrams() : log.getFruitsVegGrams());
        log.setStrengthWorkouts(req.getStrengthWorkouts() != null ? req.getStrengthWorkouts() : log.getStrengthWorkouts());
        log.setCardioMinutes(req.getCardioMinutes() != null ? req.getCardioMinutes() : log.getCardioMinutes());

        logRepo.save(log);
    }

    @Transactional(readOnly = true)
    public HealthDashboardDto getDashboard(Long userId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(27); // 28 дней

        List<DailyHealthLog> logs = logRepo.findAllByUser_IdAndLogDateBetweenOrderByLogDateAsc(userId, start, end);

        HealthDashboardDto dto = new HealthDashboardDto();

        if (logs.isEmpty()) {
            dto.setCurrentLifeExpectancy(80);
            dto.setPotentialLifeExpectancy(80);
            dto.setYearsDifference(0);
            dto.setTrend(new ArrayList<>());
            return dto;
        }

        // Средние значения
        double avgSteps = logs.stream().mapToInt(DailyHealthLog::getSteps).average().orElse(0);
        double avgSleep = logs.stream().mapToInt(l -> l.getSleepHours() * 60 + l.getSleepMinutes()).average().orElse(0) / 60.0;
        double avgProtein = logs.stream().mapToInt(DailyHealthLog::getProteinGrams).average().orElse(0);
        double avgFiber = logs.stream().mapToInt(DailyHealthLog::getFiberGrams).average().orElse(0);
        double avgVeg = logs.stream().mapToInt(DailyHealthLog::getFruitsVegGrams).average().orElse(0);

        dto.setAvgSteps(Math.round(avgSteps));
        dto.setAvgSleepHours(Math.round(avgSleep * 10.0) / 10.0);
        dto.setAvgProtein(Math.round(avgProtein));
        dto.setAvgFiber(Math.round(avgFiber));
        dto.setAvgFruitsVeg(Math.round(avgVeg));

        // Логика долголетия (Геймификация)
        int base = 80;
        int potentialBase = 90; // Идеал
        int current = base;

        // Прибавки за полезные привычки
        if (avgSteps >= 10000) current += 2;
        else if (avgSteps >= 7000) current += 1;
        else if (avgSteps < 4000) current -= 1;

        if (avgSleep >= 7.0 && avgSleep <= 9.0) current += 2;
        else if (avgSleep < 6.0) current -= 2;

        if (avgProtein >= 100) current += 1; // Упрощенно
        if (avgFiber >= 25) current += 1;
        if (avgVeg >= 400) current += 1;

        // Ограничиваем рамки
        current = Math.max(60, Math.min(potentialBase, current));

        dto.setCurrentLifeExpectancy(current);
        dto.setPotentialLifeExpectancy(potentialBase);
        dto.setYearsDifference(potentialBase - current);

        // Данные для графика
        List<HealthDashboardDto.DailyStat> trend = logs.stream().map(l -> {
            HealthDashboardDto.DailyStat stat = new HealthDashboardDto.DailyStat();
            stat.date = l.getLogDate().toString();
            stat.steps = l.getSteps();
            stat.protein = l.getProteinGrams();
            return stat;
        }).collect(Collectors.toList());

        dto.setTrend(trend);
        return dto;
    }
}