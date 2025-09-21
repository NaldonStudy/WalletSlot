package com.ssafy.b108.walletslot.backend.domain.slot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
        private String slotId;
        private String name;

        @JsonProperty("isSaving")
        private boolean isSaving;

        private String icon;
        private String color;

        private String accountSlotId;

        @JsonProperty("isCustom")
        private boolean isCustom;

        private String customName;
        private Long initialBudget;
        private Long currentBudget;
        private Long spent;
        private Long remainingBudget;

        @JsonProperty("isBudgetExceeded")
        private boolean isBudgetExceeded;

        private Long exceededBudget;
        private Integer budgetChangeCount;
    }
}
