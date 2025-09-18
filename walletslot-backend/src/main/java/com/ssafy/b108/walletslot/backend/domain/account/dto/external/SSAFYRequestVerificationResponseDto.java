package com.ssafy.b108.walletslot.backend.domain.account.dto.external;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SSAFYRequestVerificationResponseDto {

    // Field
    private Rec REC;

    // Nested Class
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Rec {

        // Field
        private String transactionUniqueNo;
    }
}
