package com.ssafy.b108.walletslot.backend.domain.notification.dto.notification;

import com.ssafy.b108.walletslot.backend.domain.notification.entity.Notification;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;

@Value
@Builder
@Jacksonized
public class NotificationDto {

    String uuid;

    String title;

    String content;

    Notification.Type type;

    boolean read;

    LocalDateTime readAt;

    Boolean delivered;

    LocalDateTime deliveredAt;

    public static NotificationDto from(final Notification n) {
        return NotificationDto.builder()
                .uuid(n.getUuid())
                .title(n.getTitle())
                .content(n.getBody())
                .type(n.getType())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .delivered(n.getIsDelivered())
                .deliveredAt(n.getDeliveredAt())
                .build();
    }
}
