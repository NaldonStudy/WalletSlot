package com.ssafy.b108.walletslot.backend.global.exception;

import com.ssafy.b108.walletslot.backend.global.dto.ErrorResponse;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
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

    // @Valid 실패(@RequestBody) 대응
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse(ErrorCode.VALIDATION_FAILED.getMessage());

        ErrorResponse body = ErrorResponse.builder()
                .message(msg) // message만 사용 (1번 포맷 유지)
                .build();

        return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.getStatus()).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public org.springframework.http.ResponseEntity<java.util.Map<String,String>> handleIllegalArgument(IllegalArgumentException ex){
        return org.springframework.http.ResponseEntity.badRequest()
                .body(java.util.Map.of("message", ex.getMessage()));
    }

    // 예측 못한 기타 예외 대응(메시지 노출 최소화)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleEtc(Exception ex) {
        ErrorResponse body = ErrorResponse.builder()
                .message(ErrorCode.INTERNAL_ERROR.getMessage()) // 내부 메시지 노출 X
                .build();

        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.getStatus()).body(body);
    }


}