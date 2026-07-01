package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.export.ExportStatus;
import com.sadramis.habit_tracker.export.ExportTask;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;

@Service
public class ExportService {

    private final GoalService goalService;
    private final ForkJoinPool forkJoinPool;
    private final Map<UUID, ExportTask> taskStore = new ConcurrentHashMap<>();

    public ExportService(GoalService goalService, ForkJoinPool forkJoinPool) {
        this.goalService = goalService;
        this.forkJoinPool = forkJoinPool;
    }

    public UUID initiateExport(Long userId) {
        UUID taskId = UUID.randomUUID();
        ExportTask task = new ExportTask();
        task.setTaskId(taskId);
        task.setUserId(userId);
        task.setExportStatus(ExportStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setCsvData(null);
        task.setErrorMessage(null);
        taskStore.put(taskId, task);

        CompletableFuture.supplyAsync(() -> generateCsv(userId), forkJoinPool)
                .whenComplete((csvData, throwable) -> {
                    if (throwable == null) {
                        task.setCsvData(csvData);
                        task.setExportStatus(ExportStatus.COMPLETED);
                    } else {
                        task.setErrorMessage(throwable.getMessage());
                        task.setExportStatus(ExportStatus.FAILED);
                    }
                });
        return taskId;
    }

    public ExportTask getTask(UUID taskId) {
        return taskStore.get(taskId);
    }

    private byte[] generateCsv(Long userId) {
        List<GoalDto> goals = goalService.getUserGoals(userId);
        String csv = convertToCsv(goals);
        return csv.getBytes(StandardCharsets.UTF_8);
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