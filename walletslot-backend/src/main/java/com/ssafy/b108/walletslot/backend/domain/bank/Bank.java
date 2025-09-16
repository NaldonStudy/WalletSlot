package com.ssafy.b108.walletslot.backend.domain.bank;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "bank")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String code;

    private String color;

    @OneToMany(mappedBy = "bank", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Account> accounts;
}
