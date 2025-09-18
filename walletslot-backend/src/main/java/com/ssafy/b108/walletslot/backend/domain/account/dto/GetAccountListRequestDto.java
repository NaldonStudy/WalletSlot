package com.ssafy.b108.walletslot.backend.domain.account.dto;

import com.ssafy.b108.walletslot.backend.common.dto.Header;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAccountListRequestDto {

    // Field
    private Header Header;
}
