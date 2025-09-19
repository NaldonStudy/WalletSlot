package com.ssafy.b108.walletslot.backend.domain.account.dto.external;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
public class SSAFYverifyAccountResponseDto {

    // Field
    @JsonProperty("REC")
    private Rec REC;

    // Nested Class
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Rec {

        // Field
        public String status;
        public String accountNo;
    }
}
