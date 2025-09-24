package com.ssafy.b108.walletslot.backend.domain.ai_report.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.DeleteAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.entity.AiReport;
import com.ssafy.b108.walletslot.backend.domain.ai_report.repository.AiReportRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.transaction.entity.Transaction;
import com.ssafy.b108.walletslot.backend.domain.transaction.repository.TransactionRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReportServiceImpl implements AiReportService {

    private final AccountRepository accountRepo;
    private final AiReportRepository aiReportRepo;
    private final TransactionRepository txRepo;
    private final ObjectMapper objectMapper;

    private final AiReportPersistService aiReportPersistService; // REQUIRES_NEW 저장 전용

    @Qualifier("ssafyGmsWebClient")
    private final WebClient ssafyGmsWebClient;

    @Value("${api.ssafy.gms.key:}")
    private String gmsApiKey;

    private static final long UNCLASSIFIED_SLOT_ID = 0L; // 내부 식별용(미분류)
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // =========================== 임의 기간 레포트 ===========================
    @Override
    @Transactional(readOnly = true)
    public GetAiReportResponseDto getReportByPeriod(final long userId,
                                                    final String accountId,  // ✅ UUID
                                                    final LocalDate startDate,
                                                    final LocalDate endDate,
                                                    final boolean persist) {

        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "[AiReport - 001] invalid date range");
        }

        log.info("[AiReport - 001] START userId={}, accountId(UUID)={}, start={}, end={}, persist={}",
                userId, accountId, startDate, endDate, persist);

        // 계좌 조회 (UUID)
        final Account account = accountRepo.findByUserIdAndUuid(userId, accountId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AiReport - 003] 계좌 없음"));

        // 기간 문자열(포함 범위) 구성
        final LocalDateTime start = startDate.atStartOfDay();
        final LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusSeconds(1);
        final String startStr = TS.format(start);
        final String endStr = TS.format(end);
        log.info("[AiReport - 005] Period resolved: {} ~ {}", startStr, endStr);

        // 현재 슬롯 편성
        final List<AccountSlot> slots = new ArrayList<>(account.getAccountSlots());
        if (slots.isEmpty()) throw new AppException(ErrorCode.NOT_FOUND, "[AiReport - 006] 계좌 슬롯이 없습니다.");

        // 내부ID(Long) ↔ UUID 매핑
        final Map<Long, String> asIdToUuid = new HashMap<>();
        final Map<Long, String> slotIdToUuid = new HashMap<>();
        for (AccountSlot as : slots) {
            asIdToUuid.put(as.getId(), as.getUuid());
            Slot s = as.getSlot();
            if (s != null) slotIdToUuid.put(s.getId(), s.getUuid());
        }

        // 거래 조회/집계
        final List<Transaction> rangeTx =
                txRepo.findByAccountIdAndTransactionAtBetween(account.getId(), start, end);
        log.debug("[AiReport - 008] fetched transactions count={}", rangeTx.size());

        final Map<Long, Long> spentByAsId = new HashMap<>();
        final Map<String, Long> merchantSum = new HashMap<>();
        final Map<Long, Map<Integer, Long>> dowByAsId = new HashMap<>();

        for (Transaction t : rangeTx) {
            final Long asId = t.getAccountSlot().getId();
            spentByAsId.merge(asId, nz(t.getAmount()), Long::sum);

            if (t.getSummary() != null && !t.getSummary().isBlank()) {
                merchantSum.merge(t.getSummary(), nz(t.getAmount()), Long::sum);
            }
            try {
                LocalDateTime when = t.getTransactionAt();
                if (when != null) {
                    int dow = when.getDayOfWeek().getValue(); // 1~7
                    dowByAsId.computeIfAbsent(asId, k -> new HashMap<>())
                            .merge(dow, nz(t.getAmount()), Long::sum);
                }
            } catch (Exception ignore) {}
        }

        long totalBudget = 0L, totalSpent = 0L, totalOvers = 0L, totalUnders = 0L;
        long oversExUncls = 0L, savedExUncls = 0L;
        final List<GetAiReportResponseDto.SlotRow> slotItems = new ArrayList<>();

        for (AccountSlot as : slots) {
            final Slot slot = as.getSlot();
            final long budget = nz(as.getCurrentBudget());
            final long spent = nz(spentByAsId.getOrDefault(as.getId(), 0L));
            final long diff = budget - spent;
            final boolean exceeded = spent > budget;
            final long overs = exceeded ? (spent - budget) : 0L;
            final long unders = exceeded ? 0L : (budget - spent);

            final boolean isUncls = (slot == null)
                    || Objects.equals(slot.getId(), UNCLASSIFIED_SLOT_ID)
                    || "미분류".equals(Optional.ofNullable(slot.getName()).orElse(""));

            totalBudget += budget;
            totalSpent += spent;
            totalOvers += overs;
            totalUnders += unders;

            if (!isUncls) {
                oversExUncls += overs;
                savedExUncls += unders;
            }

            slotItems.add(GetAiReportResponseDto.SlotRow.builder()
                    .accountSlotId(as.getUuid())                                 // ✅ UUID
                    .slotId(slot != null ? slot.getUuid() : null)                // ✅ UUID
                    .slotName(resolveName(as))
                    .unclassified(isUncls)
                    .budget(budget)
                    .spent(spent)
                    .diff(diff)
                    .exceeded(exceeded)
                    .overspend(overs)
                    .underspend(unders)
                    .baseNext(budget)
                    .allocated(0L)
                    .recommendedNextBudget(budget)
                    .deltaFromCurrent(0L)
                    .build());
        }

        // 절약액→초과 슬롯 비례 분배(천원단위)
        final long savedPool = floorK(savedExUncls);
        final long oversPool = floorK(oversExUncls);
        final Map<Long, Long> firstAlloc = new HashMap<>();
        final Map<Long, Double> frac = new HashMap<>();
        long allocatedSum = 0L;

        if (savedPool > 0 && oversPool > 0) {
            for (GetAiReportResponseDto.SlotRow r : slotItems) {
                // UUID → 내부 asId 역매핑
                Long asId = asIdToUuid.entrySet().stream()
                        .filter(e -> Objects.equals(e.getValue(), r.getAccountSlotId()))
                        .map(Map.Entry::getKey)
                        .findFirst().orElse(null);
                if (asId == null) continue;

                if (!r.isUnclassified() && r.isExceeded() && r.getOverspend() > 0) {
                    double share = ((double) r.getOverspend() / (double) oversPool) * (double) savedPool;
                    long alloc = floorK(Math.round(share));
                    firstAlloc.put(asId, alloc);
                    allocatedSum += alloc;
                    frac.put(asId, Math.max(0d, share - alloc));
                }
            }
        }
        long remain = savedPool - allocatedSum;
        if (remain > 0 && !frac.isEmpty()) {
            final List<Long> order = frac.entrySet().stream()
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            int i = 0;
            while (remain >= 1_000) {
                Long asId = order.get(i % order.size());
                firstAlloc.merge(asId, 1_000L, Long::sum);
                remain -= 1_000L;
                i++;
            }
        }

        // 추천 반영
        for (int i = 0; i < slotItems.size(); i++) {
            GetAiReportResponseDto.SlotRow r = slotItems.get(i);
            Long asId = asIdToUuid.entrySet().stream()
                    .filter(e -> Objects.equals(e.getValue(), r.getAccountSlotId()))
                    .map(Map.Entry::getKey)
                    .findFirst().orElse(null);
            long alloc = (asId != null) ? firstAlloc.getOrDefault(asId, 0L) : 0L;
            long next = r.getBaseNext() + alloc;
            slotItems.set(i, r.toBuilder()
                    .allocated(alloc)
                    .recommendedNextBudget(next)
                    .deltaFromCurrent(next - r.getBudget())
                    .build());
        }

        final GetAiReportResponseDto.Summary summary = GetAiReportResponseDto.Summary.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .totalOverspent(totalOvers)
                .totalUnderspent(totalUnders)
                .savedExcludingUnclassified(savedExUncls)
                .oversExcludingUnclassified(oversExUncls)
                .top3Slots(top3BySpent(slotItems))
                .build();

        final List<GetAiReportResponseDto.Share> sharesDto = firstAlloc.entrySet().stream()
                .map(e -> {
                    Long asId = e.getKey();
                    String asUuid = asIdToUuid.get(asId);
                    GetAiReportResponseDto.SlotRow s = slotItems.stream()
                            .filter(it -> Objects.equals(it.getAccountSlotId(), asUuid))
                            .findFirst().orElse(null);
                    String name = (s != null) ? s.getSlotName() : ("#" + asUuid);
                    double ratio = (oversPool == 0L) ? 0d
                            : (double) (s != null ? s.getOverspend() : 0L) / (double) oversPool;
                    return GetAiReportResponseDto.Share.builder()
                            .accountSlotId(asUuid) // ✅ UUID
                            .slotName(name)
                            .ratio(ratio)
                            .allocated(e.getValue())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getAllocated(), a.getAllocated()))
                .collect(Collectors.toList());

        final GetAiReportResponseDto.Redistribution redist = GetAiReportResponseDto.Redistribution.builder()
                .savedTotal(savedPool)
                .oversTotal(oversPool)
                .shares(sharesDto)
                .remainder(Math.max(0L, savedPool - sharesDto.stream().mapToLong(GetAiReportResponseDto.Share::getAllocated).sum()))
                .build();

        // 내부 인사이트 + GMS 콜
        GetAiReportResponseDto.Insights insights = buildInsights(merchantSum, dowByAsId, asIdToUuid);
        try {
            String label = startDate + "~" + endDate;
            Map<String, Object> gms = callGmsForInsightsByTextPeriod(label, slotItems, summary);
            if (gms != null) {
                insights = insights.toBuilder()
                        .aiSummary((String) gms.getOrDefault("summary", null))
                        .aiActionItems((List<String>) gms.getOrDefault("actions", Collections.emptyList()))
                        .aiRaw(gms)
                        .build();
            }
        } catch (Exception e) {
            log.warn("[AiReport - 013] GMS insights failed: {}", e.getMessage());
        }

        final GetAiReportResponseDto.Period period = GetAiReportResponseDto.Period.builder()
                .yearMonth(null) // 월 개념 없음
                .startAt(startStr)
                .endAt(endStr)
                .build();

        GetAiReportResponseDto.PersistInfo persistRef = null;
        if (persist) {
            Map<String, Object> content = new HashMap<>();
            content.put("period", period);
            content.put("summary", summary);
            content.put("slots", slotItems);
            content.put("redistribution", redist);
            content.put("insights", insights);
            persistRef = aiReportPersistService.saveInNewTx(account.getId(), content);
        }

        return GetAiReportResponseDto.builder()
                .success(true)
                .message("[AiReport - 015] OK")
                .data(GetAiReportResponseDto.Data.builder()
                        .period(period)
                        .summary(summary)
                        .slots(slotItems)
                        .redistribution(redist)
                        .insights(insights)
                        .persist(persistRef)
                        .build())
                .build();
    }

    // ============================= 삭제 =============================
    @Override
    @Transactional
    public DeleteAiReportResponseDto delete(final long userId,
                                            final String accountId, // ✅ UUID
                                            final String reportId) { // ✅ UUID

        log.info("[AiReport - 017] DELETE START userId={}, accountId(UUID)={}, reportId(UUID)={}",
                userId, accountId, reportId);

        final Account account = accountRepo.findByUserIdAndUuid(userId, accountId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AiReport - 018] 계좌 없음"));

        final AiReport report = aiReportRepo.findByUuid(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AiReport - 020] 레포트 없음"));

        // (필요시) account 소유 검증 추가 가능

        aiReportRepo.delete(report);
        log.info("[AiReport - 021] deleted reportUuid={}", reportId);

        return DeleteAiReportResponseDto.builder()
                .success(true)
                .message("[AiReport - 022] 삭제되었습니다.")
                .data(DeleteAiReportResponseDto.Data.builder()
                        .reportId(reportId) // ✅ UUID 그대로 반환
                        .build())
                .build();
    }

    // ========================== 유틸 ==========================
    private static String resolveName(AccountSlot as) {
        if (as.isCustom() && as.getCustomName() != null) return as.getCustomName();
        Slot s = as.getSlot();
        return (s != null && s.getName() != null) ? s.getName() : "미정";
    }

    private static long floorK(long v) { return (v <= 0) ? 0L : (v / 1000) * 1000; }
    private static Long nz(Long v) { return (v == null) ? 0L : v; }

    private static List<GetAiReportResponseDto.TopSlot> top3BySpent(List<GetAiReportResponseDto.SlotRow> items) {
        return items.stream()
                .sorted((a, b) -> Long.compare(b.getSpent(), a.getSpent()))
                .limit(3)
                .map(s -> GetAiReportResponseDto.TopSlot.builder()
                        .accountSlotId(s.getAccountSlotId()) // ✅ UUID
                        .slotName(s.getSlotName())
                        .spent(s.getSpent())
                        .budget(s.getBudget())
                        .build())
                .collect(Collectors.toList());
    }

    private GetAiReportResponseDto.Insights buildInsights(Map<String, Long> merchantSum,
                                                          Map<Long, Map<Integer, Long>> dowByAsId,
                                                          Map<Long, String> asIdToUuid) {
        var topMerchants = merchantSum.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> GetAiReportResponseDto.Merchant.builder()
                        .name(e.getKey())
                        .amount(e.getValue())
                        .count(0)
                        .build())
                .toList();

        // key를 UUID 문자열로 변환
        Map<String, GetAiReportResponseDto.PeakDay> peak = new HashMap<>();
        for (var e : dowByAsId.entrySet()) {
            int best = 0; long max = 0;
            for (var d : e.getValue().entrySet()) {
                if (d.getValue() > max) { max = d.getValue(); best = d.getKey(); }
            }
            String asUuid = asIdToUuid.get(e.getKey());
            if (asUuid != null) {
                peak.put(asUuid, GetAiReportResponseDto.PeakDay.builder()
                        .dayOfWeek(best)
                        .amount(max)
                        .build());
            }
        }

        return GetAiReportResponseDto.Insights.builder()
                .topMerchants(topMerchants)
                .peakDayBySlot(peak)
                .notes(List.of("미분류 제외 절약액을 초과 슬롯에 비율 배분"))
                .aiSummary(null)
                .aiActionItems(Collections.emptyList())
                .aiRaw(null)
                .build();
    }

    // GMS 호출(기간 라벨로)
    @SuppressWarnings("unchecked")
    private Map<String, Object> callGmsForInsightsByTextPeriod(String periodLabel,
                                                               List<GetAiReportResponseDto.SlotRow> slots,
                                                               GetAiReportResponseDto.Summary summary) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-5-nano");

            var msgSystem = Map.of(
                    "role", "system",
                    "content", "예산 분석가로서 한 줄 요약과 행동항목을 제공해줘. 가능하면 JSON 객체로 응답해줘."
            );

            String userContent = "period=" + periodLabel + "\n" +
                    "summary=" + summary + "\n" +
                    "slots=" + slots.stream()
                    .map(s -> String.format("%s(budget=%d, spent=%d, diff=%d)",
                            s.getSlotName(), s.getBudget(), s.getSpent(), s.getDiff()))
                    .collect(Collectors.joining("; "));

            var msgUser = Map.of("role", "user", "content", userContent);
            body.put("messages", List.of(msgSystem, msgUser));

            Map<String, Object> res = ssafyGmsWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .blockOptional()
                    .orElse(null);

            if (res == null) return null;

            String content = null;
            try {
                var choices = (List<Map<String, Object>>) res.get("choices");
                if (!choices.isEmpty()) {
                    var msg = (Map<String, Object>) choices.get(0).get("message");
                    content = (msg != null) ? (String) msg.get("content") : null;
                }
            } catch (Exception ignore) {}

            if (content == null || content.isBlank()) return null;

            String jsonOnly = extractFirstJsonObject(content);
            if (jsonOnly == null) {
                log.warn("[AiReport - 013] GMS returned no JSON object. head={}",
                        content.substring(0, Math.min(80, content.length())));
                return null;
            }

            Map<String, Object> parsed = objectMapper.readValue(jsonOnly, Map.class);

            Map<String, Object> out = new HashMap<>();
            Object s = parsed.get("summary");
            out.put("summary", (s instanceof String) ? ((String) s).strip() : null);

            Object a = parsed.get("actions");
            List<String> actions = new ArrayList<>();
            if (a instanceof List<?> list) {
                for (Object o : list) if (o != null) actions.add(String.valueOf(o).strip());
            } else if (a instanceof String str) {
                Arrays.stream(str.split("[\\r\\n•\\-]+"))
                        .map(String::trim)
                        .filter(t -> !t.isEmpty())
                        .forEach(actions::add);
            }
            if (actions.size() > 5) actions = actions.subList(0, 5);
            out.put("actions", actions);

            return out;
        } catch (Exception e) {
            log.warn("[AiReport - 013] GMS call error: {}", e.getMessage());
            return null;
        }
    }

    // JSON 오브젝트 추출기
    private static String extractFirstJsonObject(String s) {
        int depth = 0, start = -1;
        boolean inStr = false, esc = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inStr) {
                if (esc) { esc = false; continue; }
                if (c == '\\') { esc = true; continue; }
                if (c == '"') { inStr = false; }
                continue;
            }
            if (c == '"') { inStr = true; continue; }
            if (c == '{') { if (depth++ == 0) start = i; }
            else if (c == '}' && depth > 0) { if (--depth == 0 && start >= 0) return s.substring(start, i + 1); }
        }
        return null;
    }
}