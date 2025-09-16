package com.ssafy.b108.walletslot.backend.domain.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    private String email;
}
