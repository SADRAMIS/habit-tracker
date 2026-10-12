package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findAllByUser_IdOrderByCreatedAtAsc(Long userId);
    Optional<Habit> findByIdAndUser_Id(Long id, Long userId);
}