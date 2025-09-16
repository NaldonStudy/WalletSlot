package com.ssafy.b108.walletslot.backend.domain.notification;

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

    public enum Platform { ANDROID, IOS }

    public enum Status { ACTIVE, LOGGED_OUT, ACCOUNT_LOCKED, USER_WITHDRAW }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String deviceId;

    @Enumerated(EnumType.STRING)
    private Platform platform;

    private String token;

    @Enumerated(EnumType.STRING)
    private Status status;

    private boolean isPushEnabled;
}
