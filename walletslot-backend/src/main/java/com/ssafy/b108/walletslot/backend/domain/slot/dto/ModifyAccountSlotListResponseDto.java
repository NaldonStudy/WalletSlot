package com.ssafy.b108.walletslot.backend.domain.slot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModifyAccountSlotListResponseDto {

    // Field
    private boolean success;
    private String message;
    private Data data;

    // Nested Class
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Data {

        // Field
        private List<SlotDto> slots;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotDto {

        // Field
        private String accountSlotId;
        private String name;
        private boolean isSaving;
        private boolean isCustom;
        private String customName;
        private Long initialBudget;
    }
}
