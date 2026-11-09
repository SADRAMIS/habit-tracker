package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.*;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.model.InterviewMode;
import com.sadramis.habit_tracker.model.InterviewSession;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.InterviewSessionRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.llm.LlmMessage;
import com.sadramis.habit_tracker.service.llm.LlmProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import com.sadramis.habit_tracker.model.MemoryCard;
import com.sadramis.habit_tracker.repository.MemoryCardRepository;

import java.util.Map;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewSessionRepository repo;
    private final UserRepository userRepo;
    private final LlmProvider llm;
    private final ObjectMapper objectMapper;
    private final MemoryCardRepository cardRepo;

    public InterviewService(InterviewSessionRepository repo,
                            UserRepository userRepo,
                            LlmProvider llm,
                            ObjectMapper objectMapper,
                            MemoryCardRepository cardRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.llm = llm;
        this.objectMapper = objectMapper;
        this.cardRepo = cardRepo;
    }

    @Transactional
    public InterviewSessionDto start(Long userId, String modeStr) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        InterviewMode mode;
        try {
            mode = InterviewMode.valueOf(modeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неизвестный режим: " + modeStr);
        }

        List<InterviewMessageDto> messages = new ArrayList<>();
        String systemPrompt = InterviewMode.BASE_PROMPT + mode.systemPrompt;

        List<LlmMessage> kickoff = List.of(
                new LlmMessage("user", "Начни сессию. Поприветствуй меня кратко и задай первый вопрос.")
        );

        String firstReply = llm.chat(systemPrompt, kickoff);

        messages.add(new InterviewMessageDto("assistant", firstReply, Instant.now().toString()));

        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setMode(mode.name());
        session.setMessagesJson(objectMapper.writeValueAsString(messages));
        InterviewSession saved = repo.save(session);

        return toDto(saved, messages);
    }

    @Transactional
    public InterviewSessionDto sendMessage(Long userId, Long sessionId, String content) {
        InterviewSession session = repo.findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Сессия не найдена"));

        List<InterviewMessageDto> messages =
                objectMapper.readValue(session.getMessagesJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewMessageDto.class));

        messages.add(new InterviewMessageDto("user", content, Instant.now().toString()));

        List<LlmMessage> history = messages.stream()
                .map(m -> new LlmMessage(m.getRole(), m.getContent()))
                .toList();

        InterviewMode mode = InterviewMode.valueOf(session.getMode());
        String systemPrompt = InterviewMode.BASE_PROMPT + mode.systemPrompt;

        String reply = llm.chat(systemPrompt, history);
        messages.add(new InterviewMessageDto("assistant", reply, Instant.now().toString()));

        session.setMessagesJson(objectMapper.writeValueAsString(messages));
        repo.save(session);

        return toDto(session, messages);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionDto> listAll(Long userId) {
        return repo.findAllByUser_IdOrderByUpdatedAtDesc(userId).stream()
                .map(s -> {
                    List<InterviewMessageDto> msgs =
                            objectMapper.readValue(s.getMessagesJson(),
                                    objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewMessageDto.class));
                    return toDto(s, msgs);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public InterviewSessionDto getById(Long userId, Long sessionId) {
        InterviewSession s = repo.findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Сессия не найдена"));
        List<InterviewMessageDto> msgs =
                objectMapper.readValue(s.getMessagesJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewMessageDto.class));
        return toDto(s, msgs);
    }

    private InterviewSessionDto toDto(InterviewSession s, List<InterviewMessageDto> messages) {
        return new InterviewSessionDto(
                s.getId(), s.getMode(), messages,
                s.getCreatedAt(), s.getUpdatedAt()
        );
    }

    @Transactional
    public List<MemoryCardDto> generateFlashcards(Long userId, Long sessionId) {
        InterviewSession session = repo.findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Сессия не найдена"));

        List<InterviewMessageDto> messages =
                objectMapper.readValue(session.getMessagesJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, InterviewMessageDto.class));

        List<LlmMessage> history = messages.stream()
                .map(m -> new LlmMessage(m.getRole(), m.getContent()))
                .toList();

        String systemPrompt = "Ты — полезный ассистент. Проанализируй следующую сессию собеседования. " +
                "Найди 3-5 тем, в которых пользователь ошибался или не знал точного ответа. " +
                "Для каждой темы сгенерируй карточку памяти с кратким вопросом (topic) и правильным ответом (content). " +
                "Верни результат СТРОГО в формате JSON-массива объектов: " +
                "[{\"topic\": \"Вопрос по теме\", \"content\": \"Правильный ответ\"}]. " +
                "Никакого другого текста, только валидный JSON.";

        String response = llm.chat(systemPrompt, history);

        // Очищаем ответ от возможных markdown-тегов (```json ... ```)
        String cleanJson = response.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.substring(7);
        if (cleanJson.startsWith("```")) cleanJson = cleanJson.substring(3);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        cleanJson = cleanJson.trim();

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        List<MemoryCardDto> createdCards = new ArrayList<>();
        try {
            // Пытаемся распарсить JSON
            List<Map<String, String>> rawCards = objectMapper.readValue(cleanJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

            for (Map<String, String> raw : rawCards) {
                MemoryCard card = new MemoryCard();
                card.setUser(user);
                card.setTopic(raw.getOrDefault("topic", "Вопрос из интервью"));
                card.setContent(raw.getOrDefault("content", "Ответ не сгенерирован"));
                card.setTags("interview,ai");
                card.setNextReview(Instant.now());
                MemoryCard saved = cardRepo.save(card);

                createdCards.add(new MemoryCardDto(
                        saved.getId(), saved.getTopic(), saved.getContent(), saved.getTags(),
                        saved.getNextReview(), saved.getRepetitions(), saved.getEaseFactor(),
                        saved.getIntervalDays(), saved.getLastReviewedAt(), saved.getCreatedAt(),
                        null, null
                ));
            }
        } catch (Exception e) {
            // Если LLM не смог выдать идеальный JSON, возвращаем пустой список или бросаем ошибку
            throw new RuntimeException("Не удалось распарсить ответ ИИ. Попробуйте ещё раз. Ответ: " + cleanJson, e);
        }

        return createdCards;
    }
}