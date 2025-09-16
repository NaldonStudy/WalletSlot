package com.ssafy.b108.walletslot.backend.domain.auth;

import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

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
    private int failedCount;

    private LocalDateTime lockedUntil;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime lastChangedAt;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime lastVerifiedAt;
}
