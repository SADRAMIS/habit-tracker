package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findAllByUser_IdOrderByStartedAtDesc(Long userId);
    List<FocusSession> findAllByUser_IdAndStartedAtBetween(Long userId, Instant from, Instant to);
}