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

    public enum Status {
        ACTIVATE, RETIRED, REVOKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyAlias;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    private LocalDateTime rotatedAt;
}
