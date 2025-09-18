package com.ssafy.b108.walletslot.backend.domain.auth.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "user_pin", indexes = @Index(name = "ux_user_pin_user", columnList = "user_id", unique = true))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class UserPin {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "pepper_id")
    private PepperKey pepper;

    @Column(name = "bcrypted_pin", nullable = false, length = 64)
    private String bcryptedPin;

    @Column(name = "cost", nullable = false)
    private Integer cost;

    @Column(name = "failed_count", nullable = false)
    private Integer failedCount;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_changed_at", nullable = false)
    private Instant lastChangedAt;

    @Column(name = "last_verified_at", nullable = false)
    private Instant lastVerifiedAt;

    /* ===== 도메인 규칙 메서드 ===== */

    public boolean isLocked(Instant now) {
        return lockedUntil != null && now.isBefore(lockedUntil);
    }

    public boolean matches(String rawPin, String pepperSecret, BCryptPasswordEncoder bcrypt) {
        return bcrypt.matches(pepperSecret + rawPin, bcryptedPin);
    }

    public void markFail(int maxFails, Duration lockDuration, Instant now) {
        int fails = (failedCount == null ? 0 : failedCount) + 1;
        if (fails >= maxFails) {
            this.lockedUntil = now.plus(lockDuration);
            this.failedCount = 0;
        } else {
            this.failedCount = fails;
        }
    }

    public void markSuccess(Instant now) {
        this.failedCount = 0;
        this.lockedUntil = null;
        this.lastVerifiedAt = now;
    }

    public void upgrade(String rawPin,
                        PepperKey newPepper, String newPepperSecret, int newCost,
                        BCryptPasswordEncoder bcrypt, Instant now) {
        this.bcryptedPin   = bcrypt.encode(newPepperSecret + rawPin);
        this.pepper        = newPepper;
        this.cost          = newCost;
        this.lastChangedAt = now;
    }
}
