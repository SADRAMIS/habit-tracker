package com.sadramis.habit_tracker.service.llm;

import java.util.List;

public interface LlmProvider {
    String chat(String systemPrompt, List<LlmMessage> history);
}