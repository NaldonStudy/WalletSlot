package com.ssafy.b108.walletslot.backend.domain.user.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.user.dto.MePatchRequestDto;
import com.ssafy.b108.walletslot.backend.domain.user.dto.MeResponseDto;
import com.ssafy.b108.walletslot.backend.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRestController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(
            summary = "9-1-1 내 정보 조회",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "1"))
    )
    public ResponseEntity<MeResponseDto> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getMe(principal.userId()));
    }

    @PatchMapping("/me")
    @Operation(
            summary = "9-1-2 내 정보 수정(통합)",
            description = "null은 변경 없음. email/phoneNumber 변경은 인증 토큰 필요(추후 연동).",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "2"))
    )
    public ResponseEntity<MeResponseDto> patchMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid MePatchRequestDto request
    ) {
        return ResponseEntity.ok(userService.patchMe(principal.userId(), request));
    }
}
