package com.ssafy.b108.walletslot.backend.domain.notification.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.notification.dto.*;
import com.ssafy.b108.walletslot.backend.domain.notification.service.PushEndpointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "Device")
public class DeviceRestController {

    private final PushEndpointService service;

    @PostMapping("/register")
    @Operation(
            summary = "1-1 디바이스 등록/갱신",
            description = "현재 단말을 내 계정에 등록하거나 메타/푸시 토큰을 갱신합니다.",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "1"))
    )
    public ResponseEntity<RegisterDeviceResponseDto> register(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid RegisterDeviceRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registerDevice(principal.userId(), request));
    }

    @GetMapping
    @Operation(
            summary = "1-2 내 디바이스 목록 조회",
            description = "내 계정에 연동된 모든 단말을 조회합니다(최근 등록 우선).",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "2"))
    )
    public ResponseEntity<GetDeviceListResponseDto> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getMyDevices(principal.userId()));
    }

    @PatchMapping("/{deviceId}")
    @Operation(
            summary = "1-3 디바이스 상태 변경",
            description = "푸시 on/off 또는 원격 로그아웃을 수행합니다. (전역 동의는 별도 모듈)",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "3"))
    )
    public ResponseEntity<UpdateDeviceResponseDto> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String deviceId,
            @RequestBody @Valid UpdateDeviceRequestDto request
    ) {
        return ResponseEntity.ok(service.updateDevice(principal.userId(), deviceId, request));
    }

    @PostMapping("/{deviceId}/token")
    @Operation(
            summary = "1-4 FCM/WebPush 토큰 교체",
            description = "해당 단말의 푸시 토큰을 교체(재발급)합니다.",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "4"))
    )
    public ResponseEntity<ReplaceDeviceTokenResponseDto> replaceToken(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String deviceId,
            @RequestBody @Valid ReplaceTokenRequestDto request
    ) {
        return ResponseEntity.ok(service.replaceToken(principal.userId(), deviceId, request));
    }

    @DeleteMapping("/{deviceId}")
    @Operation(
            summary = "1-5 디바이스 삭제(연동 해지)",
            description = "단말과 계정 연동을 해제합니다.",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "5"))
    )
    public ResponseEntity<DeleteDeviceResponseDto> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String deviceId
    ) {
        return ResponseEntity.ok(service.deleteDevice(principal.userId(), deviceId));
    }
}
