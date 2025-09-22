package com.ssafy.b108.walletslot.backend.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

/**
 * phoneNumber 또는 email 중 "하나만" 채우는 형태로 사용.
 * (검증은 서비스에서 exactly-one 체크)
 */
@Value
@Builder
@Jacksonized
public class StartVerificationRequest {
    @Pattern(regexp = "^[+]?\\d{8,15}$")
    String phoneNumber;

    @Email
    String email;
}
