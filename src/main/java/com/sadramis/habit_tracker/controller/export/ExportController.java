package com.sadramis.habit_tracker.controller.export;

import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.export.ExportTask;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import com.sadramis.habit_tracker.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final ExportService exportService;
    private final UserRepository userRepository;

    public ExportController(ExportService exportService, UserRepository userRepository) {
        this.exportService = exportService;
        this.userRepository = userRepository;
    }

    @PostMapping("/goals")
    public ResponseEntity<Map<String, String>> startExport(Authentication auth) {
        Long userId = getUserId(auth);
        UUID taskId = exportService.initiateExport(userId);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("taskId", taskId.toString()));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getExportResult(@PathVariable UUID taskId) {
        ExportTask task = exportService.getTask(taskId);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }
        switch (task.getExportStatus()) {
            case COMPLETED:
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
                headers.setContentDispositionFormData("attachment", "goals.csv");
                return new ResponseEntity<>(task.getCsvData(), headers, HttpStatus.OK);
            case FAILED:
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", task.getErrorMessage()));
            case PENDING:
            case PROCESSING:
                return ResponseEntity.ok(Map.of("status", task.getExportStatus().name()));
            default:
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        return user.getId();
    }
}
