package com.ssafy.b108.walletslot.backend.domain.notification.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    // Enum
    public enum Type {
        // 아직 종류 미정
    }

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    @Builder.Default
    private String uuid = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 255, nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TINYTEXT")
    private String content;

    @Column(nullable = false)
    private boolean isRead;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    private LocalDateTime readAt;
    private Boolean isDelivered;
    private LocalDateTime deliveredAt;
}
