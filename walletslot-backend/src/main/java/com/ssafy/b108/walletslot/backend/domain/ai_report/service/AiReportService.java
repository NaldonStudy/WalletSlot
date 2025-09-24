package com.ssafy.b108.walletslot.backend.domain.ai_report.service;

import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.DeleteAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;

import java.time.LocalDate;

public interface AiReportService {

    GetAiReportResponseDto getReportByPeriod(long userId,
                                             String accountId,   // UUID
                                             LocalDate startDate,
                                             LocalDate endDate,
                                             boolean persist);

    DeleteAiReportResponseDto delete(long userId, String accountId, String reportId); // UUID
}
