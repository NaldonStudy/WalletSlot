package com.ssafy.b108.walletslot.backend.domain.transaction.entity;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "transaction")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64, updatable = false)
    @Builder.Default
    private String uuid = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, insertable = false, updatable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_slot_id", nullable = false, insertable = false, updatable = false)
    private AccountSlot accountSlot;

    @Column(nullable = false, insertable = false, updatable = false)
    private Long uniqueNo;

    @Column(nullable = false, insertable = false, updatable = false)
    private String type;

    @Column(length = 255, insertable = false, updatable = false)
    private String opponentAccountNo;

    @Column(nullable = false, insertable = false, updatable = false)
    private String summary;

    @Column(nullable = false, insertable = false, updatable = false)
    private Long amount;

    @Column(nullable = false, insertable = false, updatable = false)
    private Long balance;

    @Column(nullable = false, insertable = false, updatable = false)
    private String transactionAt;

    // Method
    public void addAmount(Long amount) {
        this.amount += amount;
    }

    public void minusAmount(Long amount) {
        this.amount -= amount;
    }

    public void addBalance(Long balance) {
        this.balance += balance;
    }

    public void minusBalance(Long balance) {
        this.balance -= balance;
    }

    public void changeAccountSlot(AccountSlot accountSlot) {
        this.accountSlot = accountSlot;    // 이것에 따라 발생해야하는 다른 비즈니스 로직들은 해당 Service에서 수행하도록 함. (엔티티 클래스가 과도하게 비즈니스 로직을 수행하는 것 방지)
    }
}
