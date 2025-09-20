package com.ssafy.b108.walletslot.backend.domain.notification.service;

import com.ssafy.b108.walletslot.backend.domain.notification.dto.*;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.PushEndpoint;
import com.ssafy.b108.walletslot.backend.domain.notification.repository.PushEndpointRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PushEndpointServiceImpl implements PushEndpointService {

    private final PushEndpointRepository pushRepo;
    private final UserRepository userRepo;

    // 1-1 등록/갱신
    @Override
    public RegisterDeviceResponseDto registerDevice(long userId, RegisterDeviceRequestDto req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]"));

        PushEndpoint pe = pushRepo.findByUserAndDeviceId(user, req.getDeviceId())
                .orElseGet(() -> PushEndpoint.create(
                        user, req.getDeviceId(), req.getPlatform(), req.getToken(), req.getPushEnabled()
                ));

        if (pe.getId() != null) { // 이미 있으면 갱신
            pe.refresh(req.getPlatform(), req.getToken(), req.getPushEnabled()); // pushEnabled 명시 시에만 변경
        }
        pushRepo.save(pe);

        return RegisterDeviceResponseDto.builder()
                .success(true)
                .message("[DeviceService - 000] 디바이스 등록/갱신 성공")
                .data(RegisterDeviceResponseDto.Data.builder().device(toDto(pe)).build())
                .build();
    }

    // 1-2 목록
    @Override
    public GetDeviceListResponseDto getMyDevices(long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]"));

        List<PushEndpoint> list = pushRepo.findByUserOrderByIdDesc(user);

        return GetDeviceListResponseDto.builder()
                .success(true)
                .message("[DeviceService - 000] 디바이스 목록 조회 성공")
                .data(GetDeviceListResponseDto.Data.builder()
                        .devices(list.stream().map(this::toDto).toList())
                        .build())
                .build();
    }

    // 1-3 상태변경 (푸시 on/off 또는 원격 로그아웃)
    @Override
    public UpdateDeviceResponseDto updateDevice(long userId, String deviceId, UpdateDeviceRequestDto req) {
        PushEndpoint pe = pushRepo.findByUserAndDeviceId(
                userRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]")),
                deviceId
        ).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]"));

        if (Boolean.TRUE.equals(req.getRemoteLogout())) {
            pe.remoteLogout();
        } else if (req.getPushEnabled() != null) {
            pe.updatePushEnabled(req.getPushEnabled());
        }

        return UpdateDeviceResponseDto.builder()
                .success(true)
                .message("[DeviceService - 000] 디바이스 상태 변경 성공")
                .data(UpdateDeviceResponseDto.Data.builder().device(toDto(pe)).build())
                .build();
    }

    // 1-4 토큰 교체 (푸시 설정은 건드리지 않음)
    @Override
    public ReplaceDeviceTokenResponseDto replaceToken(long userId, String deviceId, ReplaceTokenRequestDto req) {
        PushEndpoint pe = pushRepo.findByUserAndDeviceId(
                userRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]")),
                deviceId
        ).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]"));

        pe.replaceToken(req.getToken());

        return ReplaceDeviceTokenResponseDto.builder()
                .success(true)
                .message("[DeviceService - 000] FCM/WebPush 토큰 교체 성공")
                .data(ReplaceDeviceTokenResponseDto.Data.builder().device(toDto(pe)).build())
                .build();
    }

    // 1-5 삭제
    @Override
    public DeleteDeviceResponseDto deleteDevice(long userId, String deviceId) {
        PushEndpoint pe = pushRepo.findByUserAndDeviceId(
                userRepo.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]")),
                deviceId
        ).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[DeviceService - 000]"));

        DeviceDto snapshot = toDto(pe);
        pushRepo.delete(pe);

        return DeleteDeviceResponseDto.builder()
                .success(true)
                .message("[DeviceService - 000] 디바이스 삭제(연동 해지) 성공")
                .data(DeleteDeviceResponseDto.Data.builder().device(snapshot).build())
                .build();
    }

    private DeviceDto toDto(PushEndpoint e) {
        return DeviceDto.builder()
                .deviceId(e.getDeviceId())
                .platform(e.getPlatform())
                .status(e.getStatus())
                .pushEnabled(e.isPushEnabled())
                .tokenPresent(e.getToken() != null && !e.getToken().isBlank())
                .build();
    }
}
