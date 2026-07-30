package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser_Id(Long userId);
    Optional<Goal> findByIdAndUser_Id(Long id, Long userId);
}
