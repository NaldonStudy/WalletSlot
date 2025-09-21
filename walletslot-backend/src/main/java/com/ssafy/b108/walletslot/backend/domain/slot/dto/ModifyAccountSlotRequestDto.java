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
public class ModifyAccountSlotRequestDto {

    // Field
    private List<SlotDto> slots;

    // Nested Class
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class SlotDto {

        // Field
        private String slotId;
        private boolean isCustom;
        private String customName;
        private Long initialBudget;
    }
}
