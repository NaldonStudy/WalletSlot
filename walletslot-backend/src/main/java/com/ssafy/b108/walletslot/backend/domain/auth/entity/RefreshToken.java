package com.ssafy.b108.walletslot.backend.domain.auth.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * 리프레시 토큰 저장소
 * - 원문 저장 금지: tokenHash(SHA-256 Base64)만 저장
 * - 회전/재사용 탐지: revoked + parent 체인으로 관리
 */
@Entity
@Table(name = "refresh_token",
        indexes = @Index(name = "idx_rt_user_device_revoked", columnList = "user_id, device_id, revoked"))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash; // SHA-256 Base64(pepper 미권장)

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    // 회전 체인 추적(재사용 탐지 대응에 활용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private RefreshToken parent;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
