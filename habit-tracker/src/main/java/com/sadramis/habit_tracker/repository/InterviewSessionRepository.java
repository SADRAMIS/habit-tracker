package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findAllByUser_IdOrderByUpdatedAtDesc(Long userId);
    Optional<InterviewSession> findByIdAndUser_Id(Long id, Long userId);
}