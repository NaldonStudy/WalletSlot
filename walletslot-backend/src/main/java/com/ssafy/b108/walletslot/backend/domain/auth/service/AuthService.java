package com.ssafy.b108.walletslot.backend.domain.auth.service;

import com.ssafy.b108.walletslot.backend.config.security.JwtProvider;
import com.ssafy.b108.walletslot.backend.domain.auth.entity.RefreshToken;
import com.ssafy.b108.walletslot.backend.domain.auth.entity.UserPin;
import com.ssafy.b108.walletslot.backend.domain.auth.repository.RefreshTokenRepository;
import com.ssafy.b108.walletslot.backend.domain.auth.repository.UserPinRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.crypto.PasswordUpgrader;
import com.ssafy.b108.walletslot.backend.global.crypto.PepperSecretProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;                             // <-- 스프링 @Value
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;                  // <-- 스프링 @Transactional

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserPinRepository userPinRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    // 로그인 검증 시 저장된 alias로 secret을 꺼낼 때 사용
    private final PepperSecretProvider pepperSecrets;

    // pepper/cost 업그레이드(무중단 회전) 담당
    private final PasswordUpgrader passwordUpgrader;

    private final JwtProvider jwtProvider;

    @Value("${app.security.bcrypt.cost:12}")          private int targetCost;
    @Value("${app.security.jwt.refresh-ttl-days:30}")  private long refreshTtlDays;

    private static final int MAX_FAILS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(5);

    // 검증용(기존 해시 cost와 무관하게 verify 가능)
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    public record TokenPair(String accessToken, String refreshToken) {}

    @Transactional
    public TokenPair login(String phoneNumber, String rawPin, String deviceId) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 번호입니다."));

        UserPin up = userPinRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("PIN 정보가 없습니다."));

        Instant now = Instant.now();

        if (up.isLocked(now)) {
            throw new IllegalArgumentException("계정이 잠금 상태입니다. 잠시 후 다시 시도해 주세요.");
        }

        // 1) 현재 저장된 pepper(alias)로 검증
        String secret = pepperSecrets.getSecret(up.getPepperKey().getKeyAlias());
        if (!up.matches(rawPin, secret, bcrypt)) {
            up.markFail(MAX_FAILS, LOCK_DURATION, now); // 더티체킹으로 update
            throw new IllegalArgumentException("PIN이 올바르지 않습니다.");
        }

        // 2) 성공 처리
        up.markSuccess(now);

        // 3) 필요 시 즉시 업그레이드(pepper 회전 + bcrypt cost 상향)
        passwordUpgrader.upgradeIfNeeded(up, rawPin, targetCost); // 더티체킹으로 반영

        // 4) 토큰 발급 + RT 저장(원문은 해시로만 보관)
        String access = jwtProvider.createAccessToken(user.getId(), deviceId);
        String refreshPlain = generateRefreshPlain();
        String refreshHash  = sha256B64(refreshPlain);

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .deviceId(deviceId)
                .tokenHash(refreshHash)
                .expiresAt(now.plusSeconds(refreshTtlDays * 86400))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        return new TokenPair(access, refreshPlain);
    }

    private String generateRefreshPlain() {
        byte[] buf = new byte[32];
        random.nextBytes(buf);
        return "r." + Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    private String sha256B64(String s) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(md.digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
