package com.ssafy.b108.walletslot.backend.domain.notification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class UpdateDeviceRequestDto {
    Boolean pushEnabled;          // null 아니면 on/off 반영
    @NotNull
    Boolean remoteLogout; // true면 토큰 제거 + LOGGED_OUT + pushEnabled=false
}
