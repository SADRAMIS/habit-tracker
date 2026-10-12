package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    List<HabitCompletion> findAllByHabit_IdOrderByDateDesc(Long habitId);
    List<HabitCompletion> findAllByHabit_User_IdAndDateBetween(Long userId, LocalDate from, LocalDate to);
    Optional<HabitCompletion> findByHabit_IdAndDate(Long habitId, LocalDate date);
    long countByHabit_Id(Long habitId);
}