package com.ssafy.b108.walletslot.backend.domain.account.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddAccountRequestDto {

    // Field
    private List<AccountDto> accounts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    // Nested Class
    public static class AccountDto {

        // Field
        private String bankId;
        private String accountNo;
    }
}
