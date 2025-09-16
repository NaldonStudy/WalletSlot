package com.ssafy.b108.walletslot.backend.domain.transaction;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import com.ssafy.b108.walletslot.backend.domain.slot.AccountSlot;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transaction")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → account
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // FK → account_slot
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_slot_id", nullable = false)
    private AccountSlot accountSlot;

    private String uuid;

    private Long uniqueNo;

    private String type;

    private Long opponentAccountNo;

    private String counterParty;

    private Long amount;

    private Long balance;

    private String transactionAt;
}
