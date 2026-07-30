package com.sadramis.habit_tracker.exception;

import java.util.Map;

public record ErrorResponse(int status, String message, Map<String, String> errors) {

    public static ErrorResponse of(int status, String message, Map<String, String> errors) {
        return new ErrorResponse(status,message,errors);
    }

    public static ErrorResponse validationError(Map<String, String > errors) {
        return new ErrorResponse(400, "Ошибка валидации", errors);
    }
}
