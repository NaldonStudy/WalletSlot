package com.ssafy.b108.walletslot.backend.domain.auth.repository;

import com.ssafy.b108.walletslot.backend.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByJti(String jti);            // where jti = ?
    Optional<RefreshToken> findByTokenHash(String tokenHash); // where token_hash = ?

    long deleteByUserIdAndDeviceId(Long userId, String deviceId); // delete from ... where user_id=? and device_id=?
}

