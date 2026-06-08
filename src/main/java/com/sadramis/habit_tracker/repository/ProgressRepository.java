package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByGoal_IdOrderByDateDesc(Long goalId);
    @Query("SELECT SUM(p.value) FROM Progress p WHERE p.goal.id = :goalId")
    Double sumValueByGoalId(@Param("goalId") Long goalId);
}
