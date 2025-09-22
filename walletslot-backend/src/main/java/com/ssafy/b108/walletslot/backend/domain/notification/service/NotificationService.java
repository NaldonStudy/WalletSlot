package com.ssafy.b108.walletslot.backend.domain.notification.service;

import com.ssafy.b108.walletslot.backend.domain.notification.dto.notification.*;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.Notification;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    CreateNotificationResponseDto create(CreateNotificationRequestDto req);

    PullNotificationListResponseDto pullUndelivered(long userId);

    GetNotificationPageResponseDto getNotificationPage(long userId, Notification.Type type, Pageable pageable);

    CountUnreadResponseDto unreadCount(long userId);

    SimpleOkResponseDto markDelivered(long userId, String notificationUuid);

    SimpleOkResponseDto markRead(long userId, String notificationUuid);

    SimpleOkResponseDto markAllRead(long userId);

    DeleteNotificationResponseDto delete(long userId, String notificationUuid);
}
