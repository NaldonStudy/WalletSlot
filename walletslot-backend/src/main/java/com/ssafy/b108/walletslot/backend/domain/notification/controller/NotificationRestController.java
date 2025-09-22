package com.ssafy.b108.walletslot.backend.domain.notification.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.notification.dto.notification.*;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.Notification;
import com.ssafy.b108.walletslot.backend.domain.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification")
public class NotificationRestController {

    private final NotificationService service;

    @PostMapping
    @Operation(
            summary = "8-2-1 알림 생성(특정 사용자)",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "1"))
    )
    public ResponseEntity<CreateNotificationResponseDto> create(
            @RequestBody final CreateNotificationRequestDto req
    ) {
        return ResponseEntity.ok(service.create(req));
    }

    @PostMapping("/pull")
    @Operation(
            summary = "8-2-2 미전송 Pull + delivered 처리",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "2"))
    )
    public ResponseEntity<PullNotificationListResponseDto> pull(
            @AuthenticationPrincipal final UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.pullUndelivered(principal.userId()));
    }

    @GetMapping
    @Operation(
            summary = "8-2-3 목록 조회(8-2-9 type 필터 포함)",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "3"))
    )
    public ResponseEntity<GetNotificationPageResponseDto> list(
            @AuthenticationPrincipal final UserPrincipal principal,
            @RequestParam(required = false) final Notification.Type type,
            @ParameterObject final Pageable pageable
    ) {
        final Pageable pg = (pageable == null || pageable.getPageSize() <= 0)
                ? PageRequest.of(0, 20)
                : pageable;

        return ResponseEntity.ok(service.getNotificationPage(principal.userId(), type, pg));
    }

    @GetMapping("/unread-count")
    @Operation(
            summary = "8-2-4 미읽음 개수",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "4"))
    )
    public ResponseEntity<CountUnreadResponseDto> unreadCount(
            @AuthenticationPrincipal final UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.unreadCount(principal.userId()));
    }

    @PatchMapping("/{notificationUuid}/delivered")
    @Operation(
            summary = "8-2-5 단건 delivered",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "5"))
    )
    public ResponseEntity<SimpleOkResponseDto> delivered(
            @AuthenticationPrincipal final UserPrincipal principal,
            @PathVariable("notificationUuid") final String notificationUuid
    ) {
        return ResponseEntity.ok(service.markDelivered(principal.userId(), notificationUuid));
    }

    @PatchMapping("/{notificationUuid}/read")
    @Operation(
            summary = "8-2-6 단건 읽음",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "6"))
    )
    public ResponseEntity<SimpleOkResponseDto> read(
            @AuthenticationPrincipal final UserPrincipal principal,
            @PathVariable("notificationUuid") final String notificationUuid
    ) {
        return ResponseEntity.ok(service.markRead(principal.userId(), notificationUuid)); // CHANGED
    }

    @PostMapping("/read-all")
    @Operation(
            summary = "8-2-7 전체 읽음",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "7"))
    )
    public ResponseEntity<SimpleOkResponseDto> readAll(
            @AuthenticationPrincipal final UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.markAllRead(principal.userId()));
    }

    @DeleteMapping("/{notificationUuid}")
    @Operation(
            summary = "8-2-8 알림 삭제",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "8"))
    )
    public ResponseEntity<DeleteNotificationResponseDto> delete(
            @AuthenticationPrincipal final UserPrincipal principal,
            @PathVariable("notificationUuid") final String notificationUuid
    ) {
        return ResponseEntity.ok(service.delete(principal.userId(), notificationUuid)); // CHANGED
    }
}
