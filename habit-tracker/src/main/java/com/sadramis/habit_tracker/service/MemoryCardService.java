package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.MemoryCardDto;
import com.sadramis.habit_tracker.dto.MemoryCardRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.MemoryCard;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.MemoryCardRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MemoryCardService {

    private final MemoryCardRepository cardRepository;
    private final UserRepository userRepository;

    public MemoryCardService(MemoryCardRepository cardRepository, UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MemoryCardDto create(Long userId, MemoryCardRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        MemoryCard card = new MemoryCard();
        card.setUser(user);
        card.setTopic(req.getTopic());
        card.setContent(req.getContent());
        card.setTags(req.getTags());
        card.setNextReview(Instant.now());
        MemoryCard saved = cardRepository.save(card);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MemoryCardDto> getAll(Long userId) {
        return cardRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<MemoryCardDto> getDue(Long userId) {
        return cardRepository
                .findAllByUser_IdAndNextReviewLessThanEqualOrderByNextReviewAsc(userId, Instant.now())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public MemoryCardDto review(Long userId, Long cardId, int quality) {
        MemoryCard card = cardRepository.findByIdAndUser_Id(cardId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Карточка не найдена"));

        // === Алгоритм SM-2 ===
        int repetitions = card.getRepetitions();
        double ease = card.getEaseFactor();
        int interval = card.getIntervalDays();

        if (quality < 3) {
            repetitions = 0;
            interval = 1;
        } else {
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(interval * ease);
            }
            repetitions++;
        }

        ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ease < 1.3) ease = 1.3;

        card.setRepetitions(repetitions);
        card.setEaseFactor(ease);
        card.setIntervalDays(interval);
        card.setLastReviewedAt(Instant.now());
        card.setNextReview(Instant.now().plus(interval, ChronoUnit.DAYS));

        return toDto(cardRepository.save(card));
    }

    @Transactional
    public void delete(Long userId, Long cardId) {
        MemoryCard card = cardRepository.findByIdAndUser_Id(cardId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Карточка не найдена"));
        cardRepository.delete(card);
    }

    private MemoryCardDto toDto(MemoryCard c) {
        return new MemoryCardDto(
                c.getId(), c.getTopic(), c.getContent(), c.getTags(),
                c.getNextReview(), c.getRepetitions(), c.getEaseFactor(),
                c.getIntervalDays(), c.getLastReviewedAt(), c.getCreatedAt()
        );
    }
}