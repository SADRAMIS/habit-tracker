package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.BulkImportRequest;
import com.sadramis.habit_tracker.dto.MemoryCardDto;
import com.sadramis.habit_tracker.dto.MemoryCardRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.MemoryCard;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.MemoryCardRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class MemoryCardService {

    private final MemoryCardRepository cardRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;

    public MemoryCardService(MemoryCardRepository cardRepository, UserRepository userRepository, GoalRepository goalRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.goalRepository = goalRepository;
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

        if (req.getGoalId() != null) {
            Goal goal = goalRepository.findByIdAndUser_Id(req.getGoalId(), userId)
                    .orElseThrow(() -> new GoalNotFoundException("Цель не найдена"));
            card.setGoal(goal);
        }

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
                c.getIntervalDays(), c.getLastReviewedAt(), c.getCreatedAt(),
                c.getGoal() != null ? c.getGoal().getId() : null,
                c.getGoal() != null ? c.getGoal().getTitle() : null
        );
    }

    @Transactional
    public List<MemoryCardDto> bulkImport(Long userId, BulkImportRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        List<MemoryCard> cards = new ArrayList<>();
        String splitBy = req.getSplitBy() == null ? "paragraphs" : req.getSplitBy();

        switch (splitBy) {
            case "colon":
                // Каждая строка "Тема: Содержание"
                for (String line : req.getText().split("\\r?\\n")) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty()) continue;
                    int idx = trimmed.indexOf(':');
                    if (idx <= 0 || idx >= trimmed.length() - 1) continue;
                    String topic = trimmed.substring(0, idx).trim();
                    String content = trimmed.substring(idx + 1).trim();
                    if (topic.isEmpty() || content.isEmpty()) continue;
                    cards.add(buildCard(user, topic, content, req.getTags()));
                    if (cards.size() >= 50) break;
                }
                break;

            case "lines":
                for (String line : req.getText().split("\\r?\\n")) {
                    String trimmed = line.trim();
                    if (trimmed.length() < 5) continue;
                    String[] parts = splitToTopicContent(trimmed);
                    cards.add(buildCard(user, parts[0], parts[1], req.getTags()));
                    if (cards.size() >= 50) break;
                }
                break;

            case "paragraphs":
            default:
                for (String para : req.getText().split("\\n\\s*\\n")) {
                    String trimmed = para.trim().replaceAll("\\s+", " ");
                    if (trimmed.length() < 10) continue;
                    String[] parts = splitToTopicContent(trimmed);
                    cards.add(buildCard(user, parts[0], parts[1], req.getTags()));
                    if (cards.size() >= 50) break;
                }
                break;
        }

        List<MemoryCard> saved = cardRepository.saveAll(cards);
        return saved.stream().map(this::toDto).toList();
    }

    /**
     * Разбивает текст на "тему" (первые ~6 слов) и "содержание" (весь текст).
     */
    private String[] splitToTopicContent(String text) {
        String[] words = text.split("\\s+");
        String topic;
        if (words.length <= 6) {
            topic = text;
        } else {
            topic = String.join(" ", Arrays.copyOfRange(words, 0, 6)) + "…";
        }
        return new String[]{topic, text};
    }

    private MemoryCard buildCard(User user, String topic, String content, String tags) {
        MemoryCard card = new MemoryCard();
        card.setUser(user);
        card.setTopic(topic.length() > 500 ? topic.substring(0, 500) : topic);
        card.setContent(content.length() > 4000 ? content.substring(0, 4000) : content);
        card.setTags(tags);
        card.setNextReview(Instant.now());
        return card;
    }

    @Transactional(readOnly = true)
    public List<MemoryCardDto> getByGoal(Long userId, Long goalId) {
        return cardRepository.findAllByUser_IdAndGoal_IdOrderByCreatedAtDesc(userId, goalId)
                .stream().map(this::toDto).toList();
    }
}