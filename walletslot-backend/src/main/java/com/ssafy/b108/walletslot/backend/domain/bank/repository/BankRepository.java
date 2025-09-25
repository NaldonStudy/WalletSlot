package com.ssafy.b108.walletslot.backend.domain.bank.repository;

import com.ssafy.b108.walletslot.backend.domain.bank.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank, Long> {
    Optional<Bank> findByUuid(String uuid);
    Optional<Bank> findByCode(String code);
}
