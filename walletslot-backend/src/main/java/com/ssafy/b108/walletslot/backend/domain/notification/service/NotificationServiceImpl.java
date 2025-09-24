package com.ssafy.b108.walletslot.backend.domain.notification.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.AESUtil;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.notification.dto.notification.*;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.Notification;
import com.ssafy.b108.walletslot.backend.domain.notification.repository.NotificationRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.SSAFYGetTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repo;

    private final UserRepository userRepo;

    /** * 8-2-1 알림 생성 */
    @Override
    public CreateNotificationResponseDto create(final CreateNotificationRequestDto req) {
        final User user = userRepo.findById(req.getTargetUserId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 001]"));

        Notification n = Notification.builder()
                .user(user)
                .title(req.getTitle())
                .body(req.getContent())
                .type(req.getType())
                .isRead(false)
                .isDelivered(false)
                .build();

        n = repo.save(n);

        return CreateNotificationResponseDto.builder()
                .success(true)
                .message("[NotificationService - 001] 알림 생성 성공")
                .data(CreateNotificationResponseDto.Data.builder()
                        .notification(NotificationDto.from(n))
                        .build())
                .build();
    }

    /** * 8-2-2 미전송 Pull + delivered 처리 */
    @Override
    public PullNotificationListResponseDto pullUndelivered(final long userId) {
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 002]"));

        final var list = repo.findUndeliveredByUser(user);

        list.forEach(Notification::markDelivered);

        return PullNotificationListResponseDto.builder()
                .success(true)
                .message("[NotificationService - 002] 미전송 알림 Pull + delivered 처리 성공")
                .data(PullNotificationListResponseDto.Data.builder()
                        .notifications(list.stream().map(NotificationDto::from).toList())
                        .build())
                .build();
    }

    /** * 8-2-3 알림 목록 조회 (type 필터 포함) */
    @Override
    @Transactional(readOnly = true)
    public GetNotificationPageResponseDto getNotificationPage(final long userId, final Notification.Type type, final Pageable pageable) {
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 003]"));

        final Page<Notification> page = (type == null)
                ? repo.findByUserOrderByIdDesc(user, pageable)
                : repo.findByUserAndTypeOrderByIdDesc(user, type, pageable);

        return GetNotificationPageResponseDto.builder()
                .success(true)
                .message("[NotificationService - 003] 알림 목록 조회 성공")
                .data(GetNotificationPageResponseDto.Data.builder()
                        .content(page.getContent().stream().map(NotificationDto::from).toList())
                        .page(page.getNumber())
                        .size(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .build())
                .build();
    }

    /** * 8-2-4 미읽음 개수 */
    @Override
    @Transactional(readOnly = true)
    public CountUnreadResponseDto unreadCount(final long userId) {
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 004]"));

        final long cnt = repo.countByUserAndIsReadFalse(user);

        return CountUnreadResponseDto.builder()
                .success(true)
                .message("[NotificationService - 004] 미읽음 개수 조회 성공")
                .data(CountUnreadResponseDto.Data.builder().count(cnt).build())
                .build();
    }

    /** * 8-2-5 단건 delivered (UUID) */
    @Override
    public SimpleOkResponseDto markDelivered(final long userId, final String notificationUuid) {
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 005] user"));

        final Notification n = repo.findByUuidAndUser(notificationUuid, user)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 005] notification"));

        n.markDelivered();

        return SimpleOkResponseDto.builder()
                .success(true)
                .message("[NotificationService - 005] delivered 처리 성공")
                .build();
    }



    /** * 8-2-6 단건 읽음 (UUID) */
    @Override
    public SimpleOkResponseDto markRead(final long userId, final String notificationUuid) { // CHANGED
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 006]"));

        final Notification n = repo.findByUuidAndUser(notificationUuid, user)               // CHANGED
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 006]"));

        n.markRead();

        return SimpleOkResponseDto.builder()
                .success(true)
                .message("[NotificationService - 006] 읽음 처리 성공")
                .build();
    }

    /** * 8-2-7 전체 읽음 */
    @Override
    public SimpleOkResponseDto markAllRead(final long userId) {
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 007]"));

        repo.findByUserOrderByIdDesc(user, Pageable.unpaged())
                .forEach(Notification::markRead);

        return SimpleOkResponseDto.builder()
                .success(true)
                .message("[NotificationService - 007] 전체 읽음 처리 성공")
                .build();
    }

    /** * 8-2-8 알림 삭제 (UUID) */
    @Override
    public DeleteNotificationResponseDto delete(final long userId, final String notificationUuid) { // CHANGED
        final User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 008]"));

        final Notification n = repo.findByUuidAndUser(notificationUuid, user)                        // CHANGED
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[NotificationService - 008]"));

        final NotificationDto snapshot = NotificationDto.from(n);

        repo.delete(n);

        return DeleteNotificationResponseDto.builder()
                .success(true)
                .message("[NotificationService - 008] 알림 삭제 성공")
                .data(DeleteNotificationResponseDto.Data.builder().notification(snapshot).build())
                .build();
    }
}
