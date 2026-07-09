package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.export.ExportStatus;
import com.sadramis.habit_tracker.export.ExportTask;
import com.sadramis.habit_tracker.repository.ExportTaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ForkJoinPool;


import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExportServiceTest {

    @Mock
    private GoalService goalService;

    private final ForkJoinPool forkJoinPool = new ForkJoinPool(2);

    private ExportService exportService;

    @Mock
    private ExportTaskRepository repository;

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

        final ExportTask[] savedTaskHolder = new ExportTask[1];
        when(repository.save(any(ExportTask.class))).thenAnswer(invocation -> {
            ExportTask task = invocation.getArgument(0);
            savedTaskHolder[0] = task;
            return task;
        });
        when(repository.findById(any(UUID.class))).thenAnswer(invocation -> {
            UUID id = invocation.getArgument(0);
            if (savedTaskHolder[0] != null && savedTaskHolder[0].getTaskId().equals(id)) {
                return Optional.of(savedTaskHolder[0]);
            }
            return Optional.empty();
        });

        exportService = new ExportService(goalService, forkJoinPool, repository);

        UUID taskId = exportService.initiateExport(1L);

        Thread.sleep(500);

        ExportTask completedTask = exportService.getTask(taskId);
        assertThat(completedTask.getExportStatus()).isEqualTo(ExportStatus.COMPLETED);
        assertThat(completedTask.getCsvData()).isNotNull();

        String csv = new String(completedTask.getCsvData());
        assertThat(csv).contains("ID,Title,Description");
        assertThat(csv).contains("Test Goal");

        verify(repository, times(2)).save(any(ExportTask.class));
    }
}
