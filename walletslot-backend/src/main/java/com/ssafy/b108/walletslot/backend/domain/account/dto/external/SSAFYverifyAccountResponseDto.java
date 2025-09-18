package com.ssafy.b108.walletslot.backend.domain.account.dto.external;

import lombok.*;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
public class SSAFYverifyAccountResponseDto {

    // Field
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
