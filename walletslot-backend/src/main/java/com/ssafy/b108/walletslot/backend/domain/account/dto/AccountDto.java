package com.ssafy.b108.walletslot.backend.domain.account.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDto {

    // Field
    private String accountId;
    private String bankCode;
    private String bankName;
    private String accountNo;
}