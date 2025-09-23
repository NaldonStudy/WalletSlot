package com.ssafy.b108.walletslot.backend.domain.notification.entity;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    // Enum
    public enum Type {
        SYSTEM, DEVICE, BUDGET, UNCATEGORIZED, SLOT, TRANSACTION, MARKETING
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
    @lombok.Builder.Default
    private Type type = Type.SYSTEM;

    private LocalDateTime readAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDelivered = false;

    private LocalDateTime deliveredAt;

    public void markDelivered() {
        if (Boolean.TRUE.equals(this.isDelivered))
            return;

        this.isDelivered = true;
        this.deliveredAt = LocalDateTime.now();
    }

    public void markRead() {
        if (this.isRead)
            return;

        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
