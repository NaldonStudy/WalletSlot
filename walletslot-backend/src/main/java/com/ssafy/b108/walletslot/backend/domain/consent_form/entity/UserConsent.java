package com.ssafy.b108.walletslot.backend.domain.consent_form.entity;

import com.ssafy.b108.walletslot.backend.domain.consent_form.ConsentForm;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
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

    // Enum
    public enum Status { ACTIVE, EXPIRED, REVOKED }

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consent_form_id", nullable = false)
    private ConsentForm consentForm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime agreedAt;

    @Column(nullable = false)
    private LocalDateTime expiredAt;

    @Column(updatable = false)
    private LocalDateTime revokedAt;
}
