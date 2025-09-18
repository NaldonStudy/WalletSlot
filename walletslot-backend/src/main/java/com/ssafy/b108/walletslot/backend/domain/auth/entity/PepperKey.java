package com.ssafy.b108.walletslot.backend.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "pepper_key",
        indexes = { @Index(name = "ux_pepper_key_alias", columnList = "key_alias", unique = true),
                @Index(name = "ix_pepper_status",   columnList = "status") })
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class PepperKey {

    public enum Status { ACTIVE, RETIRE, REVOKE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_alias", nullable = false, unique = true, length = 64)
    private String keyAlias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "rotated_at")
    private Instant rotatedAt;

    /* 상태 전이 도메인 메서드(필요 시)
    public void activate() { this.status = Status.activate; this.rotatedAt = Instant.now(); }
    public void retire()   { this.status = Status.retired;  this.rotatedAt = Instant.now(); }
    public void revoke()   { this.status = Status.revoked;  this.rotatedAt = Instant.now(); }
    */
}
