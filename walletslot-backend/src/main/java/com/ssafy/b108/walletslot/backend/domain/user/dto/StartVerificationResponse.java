package com.ssafy.b108.walletslot.backend.domain.user.dto;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class StartVerificationResponse {
    boolean success;
    String  message;
    Data    data;

    @Value
    @Builder
    @Jacksonized
    public static class Data {
        Long    verificationId;
        Integer expiresInSec;
        Integer retryWaitSec;
        String  maskedTarget;  // "010-****-5678" 또는 "m***@mail.com"
    }
}
