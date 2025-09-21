package com.ssafy.b108.walletslot.backend.domain.slot.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddSlotListRequestDto {

    // Field
    private List<SlotDto> slots;

    // Nested Class
    @Getter
    @Setter
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
