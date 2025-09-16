package com.ssafy.b108.walletslot.backend.domain.slot;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "slot")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    private String name;

    private boolean isSavingSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account; // 커스텀 슬롯일 경우만 연결

    @Lob
    private String icon;

    private String color;

    private Integer slotRank;

    @OneToMany(mappedBy = "slot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountSlot> accountSlots;
}
