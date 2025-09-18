package com.ssafy.b108.walletslot.backend.domain.auth.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Duration;
import java.time.Instant;


import java.time.LocalDateTime;

@Entity
@Table(name = "user_pin")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPin {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pepper_id", nullable = false)
    private PepperKey pepperKey;

    @Column(nullable = false)
    private String bcryptedPin;

    @Column(columnDefinition = "TINYINT", nullable = false)
    private int cost;

    @Column(columnDefinition = "TINYINT", nullable = false)
    private Integer failedCount;

    private Instant lockedUntil;

    @Column(nullable = false, insertable = false, updatable = false)
    private Instant lastChangedAt;

    @Column(nullable = false, insertable = false, updatable = false)
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
                        PepperKey newPepperKey, String newPepperSecret, int newCost,
                        BCryptPasswordEncoder bcrypt, Instant now) {
        this.bcryptedPin   = bcrypt.encode(newPepperSecret + rawPin);
        this.pepperKey     = newPepperKey;
        this.cost          = newCost;
        this.lastChangedAt = now;
    }

}
