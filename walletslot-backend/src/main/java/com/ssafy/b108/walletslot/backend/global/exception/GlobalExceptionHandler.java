package com.ssafy.b108.walletslot.backend.global.exception;

import com.ssafy.b108.walletslot.backend.global.dto.ErrorResponse;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {

        ErrorCode errorCode = ex.getErrorCode();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(errorCode.getStatus()).body(errorResponse);
    }
}