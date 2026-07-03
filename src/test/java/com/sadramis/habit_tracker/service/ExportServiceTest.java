package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.export.ExportStatus;
import com.sadramis.habit_tracker.export.ExportTask;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.ForkJoinPool;


import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExportServiceTest {

    @Mock
    private GoalService goalService;

    private final ForkJoinPool forkJoinPool = new ForkJoinPool(2);

    private ExportService exportService;

    @Test
    void shouldCompleteExportAndStoreCsvData() throws InterruptedException {

        GoalDto testGoal = new GoalDto();
        testGoal.setId(1L);
        testGoal.setTitle("Test Goal");
        testGoal.setDescription("Test");
        testGoal.setTargetValue(10.0);
        testGoal.setDeadline(Instant.now());
        testGoal.setStatus("IN_PROGRESS");
        testGoal.setCurrentValue(3.0);
        testGoal.setCreatedAt(Instant.now());

        when(goalService.getUserGoals(anyLong()))
                .thenReturn(Collections.singletonList(testGoal));

        exportService = new ExportService(goalService, forkJoinPool);
        UUID taskId = exportService.initiateExport(1L);

        ExportTask task = exportService.getTask(taskId);
        assertThat(task).isNotNull();

        Thread.sleep(500);

        ExportTask completedTask = exportService.getTask(taskId);
        assertThat(completedTask.getExportStatus()).isEqualTo(ExportStatus.COMPLETED);
        assertThat(completedTask.getCsvData()).isNotNull();

        String csv = new String(completedTask.getCsvData());
        assertThat(csv).contains("ID,Title,Description");
        assertThat(csv).contains("Test Goal");
    }
}
