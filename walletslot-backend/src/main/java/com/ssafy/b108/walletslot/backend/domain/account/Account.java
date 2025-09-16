package com.ssafy.b108.walletslot.backend.domain.account;

import com.ssafy.b108.walletslot.backend.domain.bank.Bank;
import com.ssafy.b108.walletslot.backend.domain.slot.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    private String alias;

    @Column(nullable = false, length = 255)
    private String encryptedAccountNo;

    private Long balance;

    private boolean isPrimary;

    private LocalDateTime lastSyncedAt;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountSlot> accountSlots;
}
