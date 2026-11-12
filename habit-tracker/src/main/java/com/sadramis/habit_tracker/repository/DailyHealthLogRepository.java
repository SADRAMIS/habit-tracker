package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.DailyHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyHealthLogRepository extends JpaRepository<DailyHealthLog, Long> {
    Optional<DailyHealthLog> findByUser_IdAndLogDate(Long userId, LocalDate logDate);
    List<DailyHealthLog> findAllByUser_IdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate start, LocalDate end);
}