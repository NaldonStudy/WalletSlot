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

    @Column(insertable = false, updatable = false)
    private Long opponentAccountNo;

    @Column(nullable = false, insertable = false, updatable = false)
    private String counterParty;

    @Column(nullable = false, insertable = false, updatable = false)
    private Long amount;

    @Column(nullable = false, insertable = false, updatable = false)
    private Long balance;

    @Column(nullable = false, insertable = false, updatable = false)
    private String transactionAt;
}
