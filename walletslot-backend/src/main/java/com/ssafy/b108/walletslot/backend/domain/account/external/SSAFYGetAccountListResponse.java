package com.ssafy.b108.walletslot.backend.domain.account.external;

import com.ssafy.b108.walletslot.backend.domain.account.dto.AccountDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SSAFYGetAccountListResponse {

    // Field
    private List<AccountDto> REC;
}
