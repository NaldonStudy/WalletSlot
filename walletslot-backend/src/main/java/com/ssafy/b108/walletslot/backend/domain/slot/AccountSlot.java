package com.ssafy.b108.walletslot.backend.domain.slot;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "account_slot")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountSlot {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String uuid = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private Slot slot;

    @Column(nullable = false)
    private Long initialBudget;

    @Column(nullable = false)
    private Long currentBudget;

    @Column(nullable = false)
    private Long spent;

    @Column(nullable = false)
    private int budgetChangeCount;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isBudgetExceeded = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isCustom = false;

    @Column(length = 64)
    private String customName;

    @Column(nullable = false)
    @Builder.Default
    private boolean isAlertSent = false;
}
