package com.sadramis.habit_tracker.export;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@RedisHash
public class ExportTask {
    @Id
    private UUID taskId;
    private Long userId;
    private ExportStatus exportStatus;
    private byte[] csvData;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
