package com.sadramis.habit_tracker.service.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OllamaLlmProvider implements LlmProvider {

    @Value("${app.ai.ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${app.ai.ollama.model:llama3.1:8b}")
    private String model;

    private final RestClient restClient = RestClient.builder()
            .requestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(10000);
                setReadTimeout(180000);
            }})
            .build();

    @Override
    @SuppressWarnings("unchecked")
    public String chat(String systemPrompt, List<LlmMessage> history) {
        List<Map<String, String>> messages = new ArrayList<>();

        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (LlmMessage m : history) {
            messages.add(Map.of("role", m.role(), "content", m.content()));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("stream", false);

        String url = baseUrl + "/api/chat";

        Map<String, Object> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        try {
            Map<String, Object> message = (Map<String, Object>) response.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new RuntimeException("Не удалось распарсить ответ Ollama: " + response, e);
        }
    }
}