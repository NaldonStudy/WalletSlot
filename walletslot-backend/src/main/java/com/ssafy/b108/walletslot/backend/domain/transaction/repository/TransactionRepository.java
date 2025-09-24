package com.ssafy.b108.walletslot.backend.domain.transaction.repository;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    List<Transaction> findByAccount(Account account);
    List<Transaction> findByAccountSlot(AccountSlot accountSlot);
    Optional<Transaction> findByUuid(String transactionUuid);

    @Query("""
           select t
           from Transaction t
           where t.account.id = :accountId
             and t.transactionAt between :start and :end
           order by t.transactionAt asc
           """)
    List<Transaction> findByAccountIdAndTransactionAtBetween(
            @Param("accountId") Long accountId,
            @Param("start") String startInclusive,
            @Param("end")   String endInclusive
    );
}
