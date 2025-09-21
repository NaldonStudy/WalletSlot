package com.ssafy.b108.walletslot.backend.domain.slot.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetSlotListResponseDto {

    // Field
    private boolean success;
    private String message;
    private Data data;

    // Nested Class
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {

        // Field
        List<SlotDto> slots;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotDto {

        // Field
        private String SlotId;
        private String name;
        private boolean isSaving;
        private String icon;
        private String color;
        private Integer rank;
    }
}
