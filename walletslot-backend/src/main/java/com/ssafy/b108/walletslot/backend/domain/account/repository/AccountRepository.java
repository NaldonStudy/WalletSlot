package com.ssafy.b108.walletslot.backend.domain.account.repository;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    Optional<Account> findByUserIdAndIsPrimaryTrue(long userId);
    Optional<Account> findByEncryptedAccountNo(String encryptedAccountNo);
}
