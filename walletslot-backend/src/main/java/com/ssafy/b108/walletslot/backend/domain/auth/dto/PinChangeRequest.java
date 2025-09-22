package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PinChangeRequest {
    @Schema(example = "1234")
    @Pattern(regexp = "^[0-9]{4}$")
    private String currentPin;

    @Schema(example = "9876")
    @Pattern(regexp = "^[0-9]{4}$")
    private String newPin;
}
