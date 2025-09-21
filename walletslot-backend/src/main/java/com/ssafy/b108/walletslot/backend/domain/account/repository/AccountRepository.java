package com.ssafy.b108.walletslot.backend.domain.account.repository;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    Optional<Account> findByUserAndIsPrimaryTrue(User user);
    Optional<Account> findByUuid(String uuid);
    void deleteByUuid(String uuid);
}
