package com.ssafy.b108.walletslot.backend.domain.user.dto;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class AvatarUploadResponseDto {
    boolean success;
    String  message;
    Data    data;

    @Value
    @Builder
    @Jacksonized
    public static class Data {
        String avatarUrl; // 최종 URL
    }
}
