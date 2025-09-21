package com.ssafy.b108.walletslot.backend.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 일반적인 에러코드
    BAD_REQUEST("잘못된 요청입니다.", HttpStatus.BAD_REQUEST),
    CONFLICT("중복된 요청입니다.", HttpStatus.CONFLICT),
    VALIDATION_FAILED("요청값 검증 실패", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    NOT_FOUND("리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INTERNAL_SERVER_ERROR("알 수 없는 오류가 발생했습니다. 서버관리자에게 문의하세요.", HttpStatus.INTERNAL_SERVER_ERROR), // 서버에서 로그확인 필요

    // Slot
    ALLOCATABLE_BUDGET_EXCEEDED("할당 가능한 예산을 초과했습니다.", HttpStatus.UNPROCESSABLE_ENTITY),
    THRIFT_BUDGET_EXCEEDED("지난 달에 절약한 금액 한도 내에서만 다음달 슬롯 예산을 늘릴 수 있습니다.", HttpStatus.UNPROCESSABLE_ENTITY);

    private final String message;
    private final HttpStatus status;
}
