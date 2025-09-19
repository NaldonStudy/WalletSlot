package com.ssafy.b108.walletslot.backend.domain.auth.service;

import com.ssafy.b108.walletslot.backend.config.security.JwtProvider;
import com.ssafy.b108.walletslot.backend.global.crypto.RtHasher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(value = "app.security.refresh.enabled", havingValue = "true")
public class RefreshTokenService {

    private final JwtProvider jwt;
    private final RtHasher hasher;

    @Value("${app.security.refresh.rotation:true}")     private boolean rotation;
    @Value("${app.security.refresh.reuse-block:true}")  private boolean reuseBlock;

    /** key=jti */
    private final Map<String, Rt> store = new ConcurrentHashMap<>();

    /** 인메모리 RT 레코드 */
    private record Rt(
            Long userId,
            String deviceId,
            String hash,          // SHA-256(raw + pepper)
            Instant exp,
            boolean rotated,
            boolean revoked,
            boolean reuseDetected
    ) {}

    /** (옵션) 로그인 성공 시 RT 발급·저장 — 지금은 호출 안함 */
    public String issueAfterLogin(Long userId, String deviceId) {
        String refresh = jwt.createRefreshToken(userId, deviceId);
        String jti = jwt.extractJti(refresh);
        store.put(jti, new Rt(
                userId,
                deviceId,
                hasher.sha256Hex(refresh),
                jwt.extractExpiresAt(refresh),
                false, false, false
        ));
        return refresh;
    }

    /** 회전: 이전 RT 마킹 → 새 AT/RT 발급 */
    public Tokens rotate(String oldRefresh, String deviceId) {
        // 1) 기본 검증
        if (!jwt.validate(oldRefresh)) {
            throw new IllegalArgumentException("invalid refresh");
        }
        if (!Objects.equals("refresh", jwt.extractType(oldRefresh))) {
            throw new IllegalArgumentException("not a refresh token");
        }
        if (!Objects.equals(deviceId, jwt.extractDeviceId(oldRefresh))) {
            throw new IllegalArgumentException("device mismatch");
        }

        // 2) 저장소 조회
        String jti = jwt.extractJti(oldRefresh);
        Rt prev = store.get(jti);
        if (prev == null) {
            throw new IllegalArgumentException("unknown refresh");
        }
        if (prev.revoked() || prev.reuseDetected()) {
            throw new IllegalStateException("revoked/reused");
        }

        // 3) 재사용 탐지(원문 해시 비교)
        if (!Objects.equals(prev.hash(), hasher.sha256Hex(oldRefresh))) {
            if (reuseBlock) {
                throw new IllegalStateException("refresh reuse detected");
            }
        }

        // 4) 회전 표시
        if (rotation) {
            store.put(jti, new Rt(
                    prev.userId(),
                    prev.deviceId(),
                    prev.hash(),
                    prev.exp(),
                    true,                // rotated
                    prev.revoked(),
                    prev.reuseDetected()
            ));
        }

        // 5) 새 AT/RT 발급 + 저장
        Long userId = Long.valueOf(jwt.extractSubject(oldRefresh));
        String newAccess  = jwt.createAccessToken(userId, deviceId);
        String newRefresh = jwt.createRefreshToken(userId, deviceId);

        String newJti = jwt.extractJti(newRefresh);
        store.put(newJti, new Rt(
                userId,
                deviceId,
                hasher.sha256Hex(newRefresh),
                jwt.extractExpiresAt(newRefresh),
                false, false, false
        ));

        return new Tokens(newAccess, newRefresh);
    }

    /** 로그아웃 등으로 RT 폐기 */
    public void revoke(String refresh, String deviceId) {
        String jti = jwt.extractJti(refresh);
        Rt prev = store.get(jti);
        if (prev == null) return;
        if (!Objects.equals(prev.deviceId(), deviceId)) return;

        store.put(jti, new Rt(
                prev.userId(),
                prev.deviceId(),
                prev.hash(),
                prev.exp(),
                prev.rotated(),
                true,                 // revoked
                prev.reuseDetected()
        ));
    }

    public record Tokens(String accessToken, String refreshToken) {}
}
