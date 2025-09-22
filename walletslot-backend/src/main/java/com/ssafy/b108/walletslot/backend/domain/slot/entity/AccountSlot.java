package com.ssafy.b108.walletslot.backend.domain.slot.entity;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "account_slot")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountSlot {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    @Builder.Default
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
    @Builder.Default
    private Long spent = 0L;

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

    @OneToMany(mappedBy = "accountSlot", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SlotHistory> slotHistoryList;

    // Method
    public void updateCustomName(String customName) {
        if(customName.equals("default")) {
            this.customName = slot.getName();
            isCustom = false;
        } else {
            this.customName = customName;
            isCustom = true;
        }
    }

    public void updateBudget(Long newBudget) {
        this.currentBudget = newBudget;
        this.budgetChangeCount++;
    }

    public void updateSpent(Long spent) {
        this.spent = spent;
    }

    public void updateIsBudgetExceeded(boolean isBudgetExceeded) {
        this.isBudgetExceeded = isBudgetExceeded;
    }

    public void addBudget(Long budget) {
        this.currentBudget += budget;
        this.budgetChangeCount++;
    }

    public void minusBudget(Long budget) {
        this.currentBudget -= budget;
        this.budgetChangeCount++;
    }

    public void addSpent(Long spent) {
        this.spent += spent;
    }

    public void minusSpent(Long spent) {
        this.spent -= spent;
    }
}
