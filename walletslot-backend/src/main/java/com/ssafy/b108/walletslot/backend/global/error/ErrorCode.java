package com.ssafy.b108.walletslot.backend.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    BAD_REQUEST("잘못된 요청입니다.", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("요청값 검증 실패", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    NOT_FOUND("리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INTERNAL_ERROR("서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus status;
}
