package com.ssafy.b108.walletslot.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Email {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 64, insertable = false, updatable = false)
    private String name;

    @Column(nullable = false, length = 128, insertable = false, updatable = false)
    private String email;
}
