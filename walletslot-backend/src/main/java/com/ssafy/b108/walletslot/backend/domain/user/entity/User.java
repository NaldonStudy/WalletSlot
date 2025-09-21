package com.ssafy.b108.walletslot.backend.domain.user.entity;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // Enum
    public enum Gender { FEMALE, MAN }
    public enum Job { STUDENT, HOMEMAKER, OFFICE_WORKER, SOLDIER, SELF_EMPLOYED, FREELANCER, UNEMPLOYED, OTHER }

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    @Builder.Default
    private String uuid = UUID.randomUUID().toString();

    @Column(length = 255, nullable = false)
    private String userKey;

    @Column(length = 64, nullable = false)
    private String name;

    @Column(length = 64, nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(nullable = false)
    private LocalDateTime birthDate;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Short baseDay;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Job job;

    // Relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Account> accounts;

    // Method
    public void updateBaseDay(Short baseDay) { this.baseDay = baseDay; }
}
