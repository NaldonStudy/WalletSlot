package com.ssafy.b108.walletslot.backend.domain.ai_report.service;

import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.DeleteAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportArchiveResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.ListAiReportMonthsResponseDto;

import java.time.LocalDate;

public interface AiReportService {

    GetAiReportResponseDto getReportByPeriod(long userId,
                                             String accountId,   // UUID
                                             LocalDate startDate,
                                             LocalDate endDate,
                                             boolean persist);

    DeleteAiReportResponseDto delete(long userId, String accountId, String reportId); // UUID

    // ▼ 아카이브/월 목록
    ListAiReportMonthsResponseDto listMonths(long userId, String accountId);

    GetAiReportArchiveResponseDto getArchiveByMonthOrOffset(long userId,
                                                            String accountId,
                                                            String yearMonth,
                                                            Integer offset);
}
