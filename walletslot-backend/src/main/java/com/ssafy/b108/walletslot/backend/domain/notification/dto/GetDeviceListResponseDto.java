package com.ssafy.b108.walletslot.backend.domain.notification.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value @Builder
public class GetDeviceListResponseDto {
    boolean success;
    String message;
    Data data;

    @Value
    @Builder
    public static class Data {
        List<DeviceDto> devices;
    }
}
