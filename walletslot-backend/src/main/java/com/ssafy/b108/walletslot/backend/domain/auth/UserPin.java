package com.ssafy.b108.walletslot.backend.domain.auth;

import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_pin")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // FK → pepper_keys
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pepper_id", nullable = false)
    private PepperKey pepperKey;

    private String bcryptedPin;

    private Short cost;

    private Short failedCount;

    private LocalDateTime lockedUntil;

    private LocalDateTime lastChangedAt;

    private LocalDateTime lastVerifiedAt;
}
