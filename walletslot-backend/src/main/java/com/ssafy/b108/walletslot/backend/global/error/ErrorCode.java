package com.ssafy.b108.walletslot.backend.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHORIZED("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);

    private final String message;
    private final HttpStatus status;
}
