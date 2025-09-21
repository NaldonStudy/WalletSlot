package com.ssafy.b108.walletslot.backend.domain.slot.dto;

import lombok.*;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAccountSlotListResponseDto {

    // Field
    private boolean success;
    private String message;
    private Data data;

    // Nested Class
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Data {

        // Field
        private List<SlotDto> slots;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class SlotDto {

        // Field
        private String slotId;
        private String name;
        private boolean isSaving;
        private String icon;
        private String color;

        private String accountSlotId;
        private boolean isCustom;
        private String customName;
        private Long initialBudget;
        private Long currentBudget;
        private Long spent;
        private Long remainingBudget;
        private boolean isBudgetExceeded;
        private Long exceededBudget;
        private Integer budgetChangeCount;
    }
}
