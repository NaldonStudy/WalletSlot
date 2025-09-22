package com.ssafy.b108.walletslot.backend.domain.slot.repository;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountSlotRepository extends JpaRepository<AccountSlot, Integer> {

    Optional<List<AccountSlot>> findByAccount(Account account);
    void deleteByAccount(Account account);
    Optional<AccountSlot> findByAccountAndSlot(Account account, Slot slot);
    void deleteByAccountAndSlot(Account account, Slot slot);
    Optional<AccountSlot> findByUuid(String accountSlotUuid);
    void deleteByUuid(String accountSlotUuid);
    Optional<AccountSlot> findByAccountAndName(Account account, String name);
}
