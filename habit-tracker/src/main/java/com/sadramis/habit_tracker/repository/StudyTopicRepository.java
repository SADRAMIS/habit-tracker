package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.StudyTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyTopicRepository extends JpaRepository<StudyTopic, Long> {
    List<StudyTopic> findAllByOrderByModuleAscOrderIndexAsc();
    List<StudyTopic> findAllByModuleOrderByOrderIndexAsc(String module);
    Optional<StudyTopic> findByTitle(String title);
}