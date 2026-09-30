package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.MemoryCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemoryCardRepository extends JpaRepository<MemoryCard, Long> {
    List<MemoryCard> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
    List<MemoryCard> findAllByUser_IdAndNextReviewLessThanEqualOrderByNextReviewAsc(Long userId, Instant now);
    Optional<MemoryCard> findByIdAndUser_Id(Long id, Long userId);
}