package com.ssafy.b108.walletslot.backend.domain.account.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.b108.walletslot.backend.domain.account.dto.AccountDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SSAFYGetAccountListResponseDto {

    // Field
    @JsonProperty("REC")
    private List<AccountDto> REC;
}
