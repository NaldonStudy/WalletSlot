// src/main/java/com/ssafy/b108/walletslot/backend/domain/auth/dto/LoginRequest.java
package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @Schema(example = "01012345678")
    @NotBlank
    private String phone;

    @Schema(example = "1234")
    @NotBlank
    private String pin;

    @Schema(example = "A1B2C3D4")
    @NotBlank
    private String deviceId;
}
