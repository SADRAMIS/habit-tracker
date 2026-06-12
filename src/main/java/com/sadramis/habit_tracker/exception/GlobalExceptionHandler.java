package com.sadramis.habit_tracker.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
        ErrorResponse errorResponse = new ErrorResponse(400, "Ошибка валидации", errors);
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailConflict(EmailAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(409, ex.getMessage(), null);
        return ResponseEntity.status(409).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(500, "Внутренняя ошибка сервера", null);
        return ResponseEntity.status(500).body(errorResponse);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(404, ex.getMessage(), null);
        return ResponseEntity.status(404).body(error);
    }

    @ExceptionHandler(GoalNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleGoalNotFound(GoalNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(404, ex.getMessage(), null);
        return ResponseEntity.status(404).body(errorResponse);
    }
}
