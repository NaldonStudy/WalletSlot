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
public class ChatGPTRequestDto {

    private String model;
    private List<Message> messages;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Message {
        private String role;    // "system", "user", "assistant"
        private String content;    // 메시지 본문
    }
}