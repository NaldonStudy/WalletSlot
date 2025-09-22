package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    @Schema(example = "MAN")
    private String gender; // FEMALE / MAN

    @NotBlank
    @Schema(example = "1999-09-09")
    private String birthDate; // yyyy-MM-dd

    @NotBlank
    @Schema(description = "POST /api/auth/sms/verify-signup 에서 발급된 티켓")
    private String signupTicket;

    @Pattern(regexp = "^[0-9]{4}$")
    private String pin;

    @Min(1)
    @Max(28)
    private Integer baseDay;

    private String job; // ENUM 문자열

    @NotBlank
    private String deviceId;
    private String platform; // ANDROID/IOS (선택)
    private String pushToken; // (선택)
    private Boolean pushEnabled; // (선택)
}
