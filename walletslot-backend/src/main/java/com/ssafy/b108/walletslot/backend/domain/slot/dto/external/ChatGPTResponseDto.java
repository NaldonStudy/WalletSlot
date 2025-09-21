package com.ssafy.b108.walletslot.backend.domain.slot.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatGPTResponseDto {

    // Field
    List<Choice> choices;

    // Nested Class
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Choice {

        // Field
        private Message message;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Message {

        // Field
        private String content;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class RecommendedSlotDto {

        // Field
        private String name;
        private Long initialBudget;
    }
}