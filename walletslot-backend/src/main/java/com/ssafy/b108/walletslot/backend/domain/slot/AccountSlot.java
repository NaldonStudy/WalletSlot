package com.ssafy.b108.walletslot.backend.domain.slot;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_slot")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → account
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // FK → slot
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private Slot slot;

    private Long initialBudget;
    private Long currentBudget;
    private Long spent;
    private Integer budgetChangeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean isBudgetExceeded;
    private boolean isCustom;
    private String customName;
    private boolean isAlertSent;
}
