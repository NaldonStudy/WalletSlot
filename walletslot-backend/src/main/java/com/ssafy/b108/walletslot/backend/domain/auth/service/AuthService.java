package com.ssafy.b108.walletslot.backend.domain.auth.service;

import com.ssafy.b108.walletslot.backend.config.security.JwtProvider;
import com.ssafy.b108.walletslot.backend.domain.auth.entity.UserPin;
import com.ssafy.b108.walletslot.backend.domain.auth.repository.UserPinRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.crypto.PasswordUpgrader;
import com.ssafy.b108.walletslot.backend.global.crypto.PepperSecretProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserPinRepository userPinRepository;

    private final PepperSecretProvider pepperSecrets;   // 저장된 alias로 secret 조회
    private final PasswordUpgrader passwordUpgrader;    // pepper/cost 업그레이드
    private final JwtProvider jwtProvider;

    @Value("${app.security.bcrypt.cost:12}")
    private int targetCost;

    private static final int MAX_FAILS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(5);

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    /**
     * 리프레시 없이 AccessToken만 발급하는 로그인
     */
    @Transactional
    public String loginForAccessOnly(String phoneNumber, String rawPin, String deviceId) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 번호입니다."));

        UserPin up = userPinRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("PIN 정보가 없습니다."));

        Instant now = Instant.now();

        if (up.isLocked(now)) {
            throw new IllegalArgumentException("계정이 잠금 상태입니다. 잠시 후 다시 시도해 주세요.");
        }

        // 저장된 pepper(alias)로 검증
        String secret = pepperSecrets.getSecret(up.getPepperKey().getKeyAlias());
        if (!up.matches(rawPin, secret, bcrypt)) {
            up.markFail(MAX_FAILS, LOCK_DURATION, now); // 실패 카운트/락 업데이트
            throw new IllegalArgumentException("PIN이 올바르지 않습니다.");
        }

        // 성공 처리 + 필요하면 즉시 업그레이드(pepper 회전, cost 상향)
        up.markSuccess(now);
        passwordUpgrader.upgradeIfNeeded(up, rawPin, targetCost);

        // 액세스 토큰만 발급 (did 포함)
        return jwtProvider.createAccessToken(user.getId(), deviceId);
    }
}
