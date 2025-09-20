package com.ssafy.b108.walletslot.backend.domain.notification.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeleteDeviceResponseDto {
    boolean success;
    String message;
    Data data;

    // 삭제 전 스냅샷 반환
    @Value
    @Builder
    public static class Data {
        DeviceDto device;
    }
}
