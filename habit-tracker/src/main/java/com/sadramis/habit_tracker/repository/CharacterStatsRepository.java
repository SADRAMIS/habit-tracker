package com.sadramis.habit_tracker.repository;
import com.sadramis.habit_tracker.model.CharacterStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CharacterStatsRepository extends JpaRepository<CharacterStats, Long> {
    Optional<CharacterStats> findByUser_Id(Long userId);
}