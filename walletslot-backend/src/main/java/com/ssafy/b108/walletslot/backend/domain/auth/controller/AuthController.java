package com.ssafy.b108.walletslot.backend.domain.auth.controller;

import com.ssafy.b108.walletslot.backend.config.security.JwtProvider;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /*
    운영 전환 시: 리프레시 토큰 원문은 DB에 저장하지 말고 해시로 저장하세요. 회전·재사용 탐지 정책도 DB 레벨에서 구현.
     */

    private final JwtProvider jwtProvider;

    // 간단한 in-memory 저장소(실전은 DB + 해시 보관)
    // key: refresh 토큰 문자열, value: (userId, deviceId, 만료)
    private record Rt(Long userId, String deviceId, Instant exp) {}
    private static final Map<String, Rt> RT_STORE = new ConcurrentHashMap<>();
    private static final long RT_TTL_DAYS = 30; // dev yml의 값과 일치시키는 것을 권장

    // 로그인 요청 바디 (전화번호, PIN, 디바이스ID)
    public record LoginRequest(@NotBlank String phone, @NotBlank String pin, @NotBlank String deviceId) {}
    // 토큰 응답 페어
    public record TokenPair(String accessToken, String refreshToken) {}

    @PostMapping("/login")
    public TokenPair login(@RequestBody LoginRequest req) {
        // TODO: DB 사용자 조회 & PIN 검증(bcrypt). 지금은 phone의 해시값으로 userId 대체.
        long userId = Math.abs(req.phone().hashCode());
        // 액세스 토큰에 did를 심어서 발급
        String access = jwtProvider.createAccessToken(userId, req.deviceId());
        // 리프레시 토큰 발급(랜덤) + 메모리 저장
        String refresh = issueRefresh(userId, req.deviceId());
        return new TokenPair(access, refresh);
    }

    // 앱 전용 리프레시(헤더로 refresh 전달). 회전(Rotation) 정책: 1회용 사용 후 폐기.
    @PostMapping("/token/refresh/app")
    public TokenPair refreshForApp(@RequestHeader("Authorization") String authHeader,
                                   @RequestHeader("X-Device-Id") String deviceId) {
        // Authorization: Bearer <refresh> 형식 검증
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new IllegalArgumentException("Refresh token required");

        String refresh = authHeader.substring(7);
        // 1) 회전: 기존 토큰은 사용과 동시에 제거(재사용 방지)
        Rt rt = RT_STORE.remove(refresh);
        if (rt == null || rt.exp().isBefore(Instant.now()))
            throw new IllegalArgumentException("Invalid/expired refresh");
        // 2) 디바이스 바인딩: 저장된 deviceId와 헤더가 같아야 함
        if (!rt.deviceId().equals(deviceId))
            throw new IllegalArgumentException("Device mismatch");

        // 3) 새 액세스 + 새 리프레시 발급 (회전)
        String access = jwtProvider.createAccessToken(rt.userId(), deviceId);
        String newRefresh = issueRefresh(rt.userId(), deviceId);
        return new TokenPair(access, newRefresh);
    }

    // 로그아웃: 전달받은 refresh를 black-out(간단 버전: map에서 제거)
    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            RT_STORE.remove(token); // 실전: 디바이스 단위 전체 세션 폐기도 가능
        }
    }

    // 리프레시 토큰 발급 + 저장 (랜덤 문자열). 실전은 256비트 랜덤 + 해시 보관 권장.
    private String issueRefresh(Long userId, String deviceId) {
        String r = "r." + UUID.randomUUID();
        RT_STORE.put(r, new Rt(userId, deviceId, Instant.now().plusSeconds(RT_TTL_DAYS * 86400)));
        return r;
    }
}