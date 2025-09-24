package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SignupRequest {

    @Schema(example = "김싸피")
    @NotBlank
    private String name;

    @Schema(example = "01012345678")
    @NotBlank
    private String phone;

    @Schema(
            description = "성별 ENUM",
            example = "MAN",
            allowableValues = {"FEMALE", "MAN"}
    )
    @NotBlank
    private String gender;

    @Schema(description = "yyyy-MM-dd", example = "1999-09-09")
    @NotBlank
    private String birthDate;

    @Schema(description = "SIGNUP 검증 후 발급된 티켓", example = "3af3-....")
    @NotBlank
    private String signupTicket;

    @Schema(description = "숫자 4자리", example = "1234")
    @NotBlank
    private String pin;

    @Schema(description = "1~28 사이 권장", example = "10")
    @Min(1) @Max(28)
    private Integer baseDay;

    @Schema(
            description = "직업 ENUM",
            example = "OFFICE_WORKER",
            allowableValues = {
                    "STUDENT","HOMEMAKER","OFFICE_WORKER","SOLDIER",
                    "SELF_EMPLOYED","FREELANCER","UNEMPLOYED","OTHER"
            }
    )
    private String job;

    @Schema(example = "A1B2C3D4")
    @NotBlank
    private String deviceId;

    @Schema(
            description = "플랫폼 ENUM",
            example = "ANDROID",
            allowableValues = {"ANDROID","IOS"} // 필요 시 WEB 추가
    )
    @NotBlank
    private String platform;

    @Schema(description = "FCM 토큰 등", example = "fcm-xxx")
    private String pushToken;

    @Schema(description = "푸시 허용 여부", example = "true", defaultValue = "true")
    private Boolean pushEnabled;
}
