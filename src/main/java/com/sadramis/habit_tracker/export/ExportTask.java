package com.sadramis.habit_tracker.export;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExportTask {
    private UUID taskId;
    private Long userId;
    private ExportStatus exportStatus;
    private byte[] csvData;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
