package com.ssafy.b108.walletslot.backend.domain.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pepper_key")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PepperKey {

    // Enum
    public enum Status { ACTIVATE, RETIRED, REVOKED }

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true)
    private String keyAlias;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime rotatedAt;
}
