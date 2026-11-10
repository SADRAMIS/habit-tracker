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

        String systemPrompt = "Ты — эксперт по Java. Проанализируй этот диалог. " +
                "Найди 3 темы, в которых пользователь дал неверный или неполный ответ. " +
                "Верни ответ ТОЛЬКО в виде валидного JSON-массива объектов, без лишнего текста и без markdown. " +
                "Формат: [{\"topic\": \"Краткий вопрос\", \"content\": \"Правильный ответ\"}]. " +
                "Если пользователь ответил на все вопросы идеально, верни просто []. ";

        String response = llm.chat(systemPrompt, history);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new GoalNotFoundException("Пользователь не найден"));

        List<MemoryCardDto> createdCards = new ArrayList<>();

        // === ПОПЫТКА 1: ПАРСИМ ОТВЕТ ИИ ===
        if (response != null && !response.trim().isEmpty()) {
            int startIndex = response.indexOf('[');
            int endIndex = response.lastIndexOf(']');

            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                String cleanJson = response.substring(startIndex, endIndex + 1);
                try {
                    List<Map<String, String>> rawCards = objectMapper.readValue(cleanJson,
                            objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));

                    for (Map<String, String> raw : rawCards) {
                        if (raw.get("topic") == null || raw.get("content") == null) continue;
                        createdCards.add(saveCard(user, raw.get("topic"), raw.get("content")));
                    }
                } catch (Exception ignored) {
                    // Если JSON кривой — просто идем в fallback
                }
            }
        }

        // === ПОПЫТКА 2: FALLBACK (ЕСЛИ ИИ НЕ СПРАВИЛСЯ) ===
        if (createdCards.isEmpty()) {
            // Берем последние 2 сообщения (вопрос ассистента и ответ пользователя)
            for (int i = messages.size() - 1; i >= 0; i--) {
                if ("assistant".equals(messages.get(i).getRole()) && i > 0) {
                    String question = messages.get(i).getContent();
                    String answer = messages.get(i - 1).getContent(); // Предыдущее сообщение юзера

                    // Создаем карточку: Вопрос -> Правильный ответ (или твой ответ, если ИИ не дал правильный)
                    createdCards.add(saveCard(user, "Вопрос: " + shorten(question), "Твой ответ: " + shorten(answer) + "\n\n(Проверь правильность ответа в документации)"));
                    break; // Создаем только одну карточку из последнего вопроса, чтобы не спамить
                }
            }
        }

        // Если вообще нет сообщений, создаем заглушку
        if (createdCards.isEmpty()) {
            createdCards.add(saveCard(user, "Интервью с ИИ", "Ты прошел сессию, но слабые места не выявлены."));
        }

        return createdCards;
    }

    // Вспомогательный метод для сохранения карточки
    private MemoryCardDto saveCard(User user, String topic, String content) {
        MemoryCard card = new MemoryCard();
        card.setUser(user);
        card.setTopic(topic);
        card.setContent(content);
        card.setTags("interview,ai");
        card.setNextReview(Instant.now());
        MemoryCard saved = cardRepo.save(card);
        return new MemoryCardDto(
                saved.getId(), saved.getTopic(), saved.getContent(), saved.getTags(),
                saved.getNextReview(), saved.getRepetitions(), saved.getEaseFactor(),
                saved.getIntervalDays(), saved.getLastReviewedAt(), saved.getCreatedAt(),
                null, null
        );
    }

    private String shorten(String text) {
        if (text == null) return "";
        return text.length() > 300 ? text.substring(0, 300) + "..." : text;
    }
}