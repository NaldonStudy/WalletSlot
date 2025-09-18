package com.ssafy.b108.walletslot.backend.global.crypto;

import com.ssafy.b108.walletslot.backend.domain.auth.entity.PepperKey;
import com.ssafy.b108.walletslot.backend.domain.auth.entity.UserPin;
import com.ssafy.b108.walletslot.backend.domain.auth.repository.PepperKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class PasswordUpgrader {

    private final PepperKeyRepository pepperKeyRepository;
    private final PepperSecretProvider pepperSecrets;   // alias → secret 제공자
    private final BCryptPasswordEncoder verifier = new BCryptPasswordEncoder();

    /**
     * 로그인 성공 직후 호출:
     * - 현재 pepper로 이미 맞으면 아무것도 안 함
     * - 저장된 pepper(과거 alias)로 맞으면 현재 pepper + targetCost로 재해시
     */
    public boolean upgradeIfNeeded(UserPin pin, String rawPin, int targetCost) {
        // 1) 활성 pepper 및 secret
        PepperKey active = pepperKeyRepository
                .findFirstByStatusOrderByCreatedAtDesc(PepperKey.Status.ACTIVE) // <-- ACTIVE 로 수정
                .orElseThrow(() -> new IllegalStateException("활성 pepper가 없습니다."));
        String currentSecret = pepperSecrets.getSecret(active.getKeyAlias());

        // 2) 이미 현재 pepper로 맞으면 업그레이드 불필요 (도메인 메서드 재사용)
        if (pin.matches(rawPin, currentSecret, verifier)) {
            return false;
        }

        // 3) 저장된 pepper(alias)의 secret로 재검증
        String savedSecret = pepperSecrets.getSecret(pin.getPepperKey().getKeyAlias());
        if (!pin.matches(rawPin, savedSecret, verifier)) {
            return false; // 업그레이드 대상 아님
        }

        // 4) 현재 pepper + 목표 cost 로 재해시
        BCryptPasswordEncoder rehash = new BCryptPasswordEncoder(targetCost);
        pin.upgrade(rawPin, active, currentSecret, targetCost, rehash, Instant.now());
        return true; // @Transactional 컨텍스트에서 더티체킹으로 반영
    }
}
