package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.StudyTopicDto;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.StudyTopic;
import com.sadramis.habit_tracker.repository.StudyTopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudyTopicService {

    private final StudyTopicRepository repo;

    public StudyTopicService(StudyTopicRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<StudyTopicDto> getAll() {
        return repo.findAllByOrderByModuleAscOrderIndexAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getModules() {
        return repo.findAllByOrderByModuleAscOrderIndexAsc().stream()
                .map(StudyTopic::getModule).distinct().toList();
    }

    @Transactional(readOnly = true)
    public StudyTopicDto getById(Long id) {
        StudyTopic t = repo.findById(id)
                .orElseThrow(() -> new GoalNotFoundException("Тема не найдена"));
        return toDto(t);
    }

    private StudyTopicDto toDto(StudyTopic t) {
        return new StudyTopicDto(
                t.getId(), t.getModule(), t.getTitle(), t.getSummary(),
                t.getContent(), t.getVisualization(), t.getFacts(),
                t.getTags(), t.getOrderIndex(), t.getCreatedAt()
        );
    }
}