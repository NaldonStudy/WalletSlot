package com.ssafy.b108.walletslot.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "user", indexes = @Index(name = "ix_user_phone", columnList = "phone_number"))
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Builder 전용
@Builder
public class User {

    public enum Gender { FEMALE, MAN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    @Column(name = "phone_number", nullable = false, length = 64)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 8)
    private Gender gender;

    @Column(name = "birth_date", nullable = false)
    private LocalDateTime birthDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "base_day", nullable = false)
    private Integer baseDay;

    @Column(name = "job", length = 32)
    private String job;

    /* === 변경 행위 메서드(예시) ===
    public void changeProfile(String name, String job) {
        this.name = name;
        this.job = job;
    }
    */
}
