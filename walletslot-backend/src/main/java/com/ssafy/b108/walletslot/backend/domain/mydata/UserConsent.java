package com.ssafy.b108.walletslot.backend.domain.mydata;

import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_consent")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserConsent {

    public enum Status { ACTIVE, EXPIRED, REVOKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // FK → consent_form
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consent_form_id", nullable = false)
    private ConsentForm consentForm;

    private LocalDateTime agreedAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime expiredAt;

    private LocalDateTime revokedAt;
}
