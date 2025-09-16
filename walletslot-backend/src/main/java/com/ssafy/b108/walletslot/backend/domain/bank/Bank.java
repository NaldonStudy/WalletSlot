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

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64, nullable = false)
    private String name;

    @Column(length = 64, nullable = false)
    private String code;

    @Column(length = 64, nullable = false)
    private String color;

    @OneToMany(mappedBy = "bank", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Account> accounts;
}
