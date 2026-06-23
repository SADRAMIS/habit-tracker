package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ExportService {

    private final GoalService goalService;

    public ExportService(GoalService goalService) {
        this.goalService = goalService;
    }

    @Async
    public CompletableFuture<byte[]> exportUserGoals(Long userId) {
        List<GoalDto> goals = goalService.getUserGoals(userId);
        String csv = convertToCsv(goals);
        return CompletableFuture.completedFuture(csv.getBytes(StandardCharsets.UTF_8));
    }

    private String convertToCsv(List<GoalDto> goals) {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Description,TargetValue,Deadline,Status,CurrentValue,CreatedAt\n");
        for (GoalDto g : goals) {
            sb.append(String.format("%d,%s,%s,%.2f,%s,%s,%.2f,%s\n",
                    g.getId(),
                    escapeCsv(g.getTitle()),
                    escapeCsv(g.getDescription()),
                    g.getTargetValue(),
                    g.getDeadline(),
                    g.getStatus(),
                    g.getCurrentValue(),
                    g.getCreatedAt()));
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}