package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PinResetConsumeRequest {
    @Schema(example = "01012345678")
    @NotBlank
    private String phone;

    @Schema(example = "123456")
    @NotBlank
    private String resetCode;

    @Schema(example = "4321")
    @Pattern(regexp = "^[0-9]{4}$")
    private String newPin;
}
