package com.ssafy.b108.walletslot.backend.domain.device;

import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "push_endpoint")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushEndpoint {

    // Enum
    public enum Platform { ANDROID, IOS }
    public enum Status { ACTIVE, LOGGED_OUT, ACCOUNT_LOCKED, USER_WITHDRAW }

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 64, nullable = false, updatable = false)
    private String deviceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private Platform platform;

    @Column(length = 255, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(nullable = false)
    private boolean isPushEnabled = true;
}
