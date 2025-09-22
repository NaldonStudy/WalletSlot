package com.ssafy.b108.walletslot.backend.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class ConfirmVerificationRequest {
    @NotNull  Long   verificationId;
    @NotBlank String code;
}
