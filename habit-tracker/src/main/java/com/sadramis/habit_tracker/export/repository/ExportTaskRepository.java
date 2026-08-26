package com.sadramis.habit_tracker.export.repository;

import com.sadramis.habit_tracker.export.ExportTask;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExportTaskRepository extends CrudRepository<ExportTask, UUID> {}
