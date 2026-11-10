package com.sadramis.habit_tracker.repository;

import com.sadramis.habit_tracker.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<Book> findByIdAndUser_Id(Long id, Long userId);
}