package com.ssafy.b108.walletslot.backend.domain.notification.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UpdateDeviceResponseDto {
    boolean success;
    String message;
    Data data;

    @Value
    @Builder
    public static class Data {
        DeviceDto device;
    }
}
