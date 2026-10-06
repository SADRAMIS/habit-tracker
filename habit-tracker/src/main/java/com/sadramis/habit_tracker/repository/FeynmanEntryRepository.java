package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.FeynmanEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeynmanEntryRepository extends JpaRepository<FeynmanEntry, Long> {
    List<FeynmanEntry> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
    List<FeynmanEntry> findAllByUser_IdAndTopicIdOrderByCreatedAtDesc(Long userId, Long topicId);
}