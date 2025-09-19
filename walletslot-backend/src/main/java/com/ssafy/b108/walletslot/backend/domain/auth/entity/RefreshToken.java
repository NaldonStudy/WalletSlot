package com.ssafy.b108.walletslot.backend.domain.auth.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
        name = "refresh_token",
        indexes = {
                @Index(name = "idx_rt_user_device", columnList = "user_id, device_id"),
                @Index(name = "idx_rt_expires", columnList = "expires_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_rt_jti", columnNames = "jti"),
                @UniqueConstraint(name = "uk_rt_token_hash", columnNames = "token_hash")
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    /** 토큰 고유 식별자(UUID 등) */
    @Column(name = "jti", nullable = false, length = 64)
    private String jti;

    /** SHA-256 HEX(64) of raw refresh token + pepper */
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** 회전된 시점(회전 전 RT 레코드에 표시) */
    @Column(name = "rotated_at")
    private Instant rotatedAt;

    /** 명시적 폐기(로그아웃/강제 로그아웃 등) 시점 */
    @Column(name = "revoked_at")
    private Instant revokedAt;

    /** 회전된 이전 RT 재사용 탐지 여부 */
    @Column(name = "reuse_detected", nullable = false)
    @Builder.Default
    private boolean reuseDetected = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;
}
