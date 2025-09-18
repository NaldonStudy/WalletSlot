package com.ssafy.b108.walletslot.backend.domain.account.dto.external;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SSAFYGetAccountHolderNameResponseDto {

    // Field
    private Rec REC;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    // Nested Class
    public static class Rec {

        // Field
        private String userName;
    }
}
