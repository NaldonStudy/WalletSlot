package com.ssafy.b108.walletslot.backend.domain.ai_report.repository;

import com.ssafy.b108.walletslot.backend.domain.ai_report.entity.AiReport;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiReportRepository extends JpaRepository<AiReport, Long> {
    Optional<AiReport> findFirstByAccountOrderByCreatedAtDesc(Account account);

    Optional<AiReport> findByUuid(String uuid);
    void deleteByUuid(String uuid);
}
