package com.ssafy.b108.walletslot.backend.domain.ai_report.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.entity.AiReport;
import com.ssafy.b108.walletslot.backend.domain.ai_report.repository.AiReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReportPersistService {

    private final AiReportRepository aiReportRepo;
    private final AccountRepository accountRepo;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = false)
    public GetAiReportResponseDto.PersistInfo saveInNewTx(Long accountId, Map<String, Object> content) {
        try {
            JsonNode json = objectMapper.valueToTree(content);
            Account accountRef = accountRepo.getReferenceById(accountId);

            AiReport saved = aiReportRepo.save(
                    AiReport.builder()
                            .account(accountRef)
                            .content(json)
                            .build()
            );

            return GetAiReportResponseDto.PersistInfo.builder()
                    .id(saved.getUuid())            // ✅ 외부에는 UUID만
                    .createdAt(saved.getCreatedAt())
                    .build();

        } catch (DataIntegrityViolationException e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.warn("[AiReport - PERSIST] DataIntegrityViolation: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.warn("[AiReport - PERSIST] skipped: {} {}", e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }
}
