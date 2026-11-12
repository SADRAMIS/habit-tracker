package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.BookDto;
import com.sadramis.habit_tracker.dto.BookRequest;
import com.sadramis.habit_tracker.exception.GoalNotFoundException;
import com.sadramis.habit_tracker.exception.UserNotFoundException;
import com.sadramis.habit_tracker.model.Book;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.BookRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final CharacterService characterService;

    public BookService(BookRepository bookRepo, UserRepository userRepo, CharacterService characterService) {
        this.bookRepo = bookRepo;
        this.userRepo = userRepo;
        this.characterService = characterService;
    }

    @Transactional
    public BookDto create(Long userId, BookRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        Book book = new Book();
        book.setUser(user);
        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setGenre(req.getGenre());
        book.setTotalPages(req.getTotalPages() != null ? req.getTotalPages() : 0);
        book.setNotes(req.getNotes());
        book.setCurrentPage(0);
        book.setStatus("WANT_TO_READ");

        Book saved = bookRepo.save(book);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookDto> getAll(Long userId) {
        return bookRepo.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public BookDto updateProgress(Long userId, Long bookId, int currentPage) {
        Book book = bookRepo.findByIdAndUser_Id(bookId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Книга не найдена"));

        book.setCurrentPage(currentPage);

        if (book.getTotalPages() > 0 && currentPage >= book.getTotalPages() && !book.getStatus().equals("COMPLETED")) {
            book.setStatus("COMPLETED");
            // 🆕 Начисляем 100 XP за прочитанную книгу (INT)
            characterService.addXp(userId, 100, "intelligence");
        } else if (book.getStatus().equals("WANT_TO_READ")) {
            book.setStatus("READING");
        }

        return toDto(bookRepo.save(book));
    }

    @Transactional
    public BookDto updateStatus(Long userId, Long bookId, String status) {
        Book book = bookRepo.findByIdAndUser_Id(bookId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Книга не найдена"));
        book.setStatus(status);
        return toDto(bookRepo.save(book));
    }

    @Transactional
    public void delete(Long userId, Long bookId) {
        Book book = bookRepo.findByIdAndUser_Id(bookId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Книга не найдена"));
        bookRepo.delete(book);
    }

    private BookDto toDto(Book b) {
        return new BookDto(
                b.getId(), b.getTitle(), b.getAuthor(), b.getGenre(),
                b.getStatus(), b.getCurrentPage(), b.getTotalPages(),
                b.getNotes(), b.getCreatedAt()
        );
    }
}