package com.ssafy.b108.walletslot.backend.domain.account.repository;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
}
