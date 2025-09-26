package com.ssafy.b108.walletslot.backend.domain.slot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.AESUtil;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.Notification;
import com.ssafy.b108.walletslot.backend.domain.notification.entity.PushEndpoint;
import com.ssafy.b108.walletslot.backend.domain.notification.repository.NotificationRepository;
import com.ssafy.b108.walletslot.backend.domain.notification.repository.PushEndpointRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.*;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.ChatGPTRequestDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.ChatGPTResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.SSAFYGetTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.SlotDto;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.SlotHistory;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotHistoryRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.entity.Transaction;
import com.ssafy.b108.walletslot.backend.domain.transaction.repository.TransactionRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import com.ssafy.b108.walletslot.backend.infrastructure.fcm.service.FcmService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.SecretKey;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class SlotService {

    // Field
    private final SlotRepository slotRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountSlotRepository accountSlotRepository;
    private final SlotHistoryRepository slotHistoryRepository;
    private final RestTemplate restTemplate;
    private final SecretKey encryptionKey;
    @Qualifier("ssafyGmsWebClient") private final WebClient ssafyGmsWebClient;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final PushEndpointRepository pushEndpointRepository;

    private final FcmService fcmService;

    @Value("${api.ssafy.finance.apiKey}")
    private String ssafyFinanceApiKey;

    @Value("${api.ssafy.gms.key}")
    private String ssafyGmsKey;

    private static Map<String, String> incomes = new HashMap<>(); // 수입구간

    // Static Block
    static {
        incomes.put("F", "1백만원 ~ 2백만원");
        incomes.put("E", "2백만원 ~ 3백만원");
        incomes.put("D", "3백만원 ~ 4백만원");
        incomes.put("C", "4백만원 ~ 5백만원");
        incomes.put("B", "5백만원 ~ 1천만원");
        incomes.put("A", "1천만원 이상");
    }

    // Method
    // 5-1-1
    public GetSlotListResponseDto getSlotList() {

        // slot 리스트 전부 조회해오기
        List<Slot> slotList = slotRepository.findAll();

        // dto 조립
        // dto > data > slots
        List<GetSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
        for(Slot slot : slotList){
            GetSlotListResponseDto.SlotDto slotDto = GetSlotListResponseDto.SlotDto.builder()
                    .SlotId(slot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .rank(slot.getRank())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto
        GetSlotListResponseDto getSlotListResponseDto = GetSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 001] 슬롯 전체조회 성공")
                .data(GetSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getSlotListResponseDto;
    }

    // 5-1-2
    public ModifyAccountSlotResponseDto modifyAccountSlot(Long userId, String accountUuid, String accountSlotUuid, ModifyAccountSlotRequestDto request) {

        // User 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "SlotService - 000"));

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 002]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 003]");
        }

        // AccountSlot 조회
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 005]"));

        // update
        String customName = request.getCustomName();
        if(customName != null) {
            if(customName.equals("default")) {
                accountSlot.updateCustomName(null);
                accountSlot.updateIsCustom(false);
            } else{
                accountSlot.updateCustomName(customName);
                accountSlot.updateIsCustom(true);
            }
        }

        if(request.getNewBudget() != null) {
            if(request.getNewBudget() == 0) {

                // newBudget이 0이면 해당 슬롯 삭제하고 거기에 할당돼있던 예산과 거래내역을 모두 미분류 슬롯으로 이동
                AccountSlot uncategorizedAccountSlot = accountSlotRepository.findUncategorizedSlot(account).orElseThrow(() -> new AppException(ErrorCode.MISSING_UNCATEGORIZED_SLOT, "SlotService - 000"));
                uncategorizedAccountSlot.updateBudget(uncategorizedAccountSlot.getCurrentBudget()+accountSlot.getCurrentBudget());

                List<Transaction> transactions = transactionRepository.findByAccountSlot(accountSlot);
                for(Transaction transaction : transactions) {
                    transaction.changeAccountSlot(uncategorizedAccountSlot);
                }

                accountSlot.getSlot().decreaseRank();
                accountSlotRepository.delete(accountSlot);

                // 이때 푸시알림 줘야하는지 고민. 그냥 서비스 내에서 알림창 잠깐 뜨게 하는게 좋을지도
            } else {
                Long oldBudget = accountSlot.getCurrentBudget(); // 기존 예산
                accountSlot.updateBudget(request.getNewBudget()); // 새로운 예산
                accountSlot.increaseBudgetChangeCount(); // 예산 변경횟수 +1

                // 예산 초과여부 다시 검사
                if(accountSlot.getSpent() > accountSlot.getCurrentBudget()) {
                    if(accountSlot.isBudgetExceeded() == true) {
                        // 원래도 초과상태였으면 그냥 가만히 있으면 됨
                    } else { // 원래 초과상태 아니었으면 푸시알림 보내야 함
                        accountSlot.updateIsBudgetExceeded(true); // 일단 예산초과 필드 true로 바꿔주고
                        Notification notification = Notification.builder() // Notification 객체 만들어서 저장하기
                                .user(user)
                                .title("[지출초과] " + accountSlot.getName() + " 슬롯의 예산이 초과됐어요!⚠️")
                                .body("슬롯의 예산을 조금 증액하고, 남은 기간 동안 해당 슬롯에 대한 지출을 줄여서 예산 안에서 소비할 수 있도록 해보세요. 계획안 예산 안에서 소비해야 좋은 소비습관을 기를 수 있어요")
                                .type(Notification.Type.BUDGET)
                                .build();

                        notificationRepository.save(notification);

                        // 푸시 엔드포인트 상태보고 푸시알림 보내기
                        PushEndpoint pushEndpoint = pushEndpointRepository.findByUser(user).orElseThrow(() -> new AppException(ErrorCode.PUSH_ENDPOINT_NOTFOUND, "푸시알림을 받을 기기가 없는 사용자입니다. 기기를 등록해주세요."));
                        if(pushEndpoint.getStatus() == PushEndpoint.Status.ACTIVE) {
                            fcmService.sendMessage(pushEndpoint.getToken(), notification.getTitle(), notification.getBody())
                                    .subscribe(
                                            response -> {
                                                System.out.println("✅ FCM 전송 성공: " + response);
                                                notification.updateIsDelivered(true);
                                            },
                                            error -> {
                                                System.err.println("❌ FCM 전송 실패: " + error.getMessage());
                                                notification.updateIsDelivered(false);
                                            }
                                    );
                        }
                    }

                } else {
                    accountSlot.updateIsBudgetExceeded(false);
                }

                // SlotHistory 기록
                SlotHistory slotHistory = SlotHistory.builder()
                        .accountSlot(accountSlot)
                        .oldBudget(oldBudget)
                        .newBudget(request.getNewBudget())
                        .build();

                slotHistoryRepository.save(slotHistory);
            }
        }

        // dto 조립
        ModifyAccountSlotResponseDto modifyAccountSlotResponseDto = ModifyAccountSlotResponseDto.builder()
                .success(true)
                .message("[SlotService - 006] 슬롯 정보수정 성공")
                .data(ModifyAccountSlotResponseDto.Data.builder().accountSlotId(accountSlot.getUuid()).customName(request.getCustomName()).newBudget(request.getNewBudget()).build())
                .build();

        return modifyAccountSlotResponseDto;
    }

    // 5-1-3
    public RemoveAccountSlotResponseDto removeAccountSlot(Long userId, String accountUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "SlotService - 007"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "SlotService - 008");
        }

        // accountSlot 조회
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_SLOT_NOT_FOUND, "SlotService - 009"));

        // accountSlot의 currentBudget을 미분류로 이동 (기존 accountSlot rank--)
        // accountSlot에 연결돼있던 거래내역들 전부 미분류로 이동
        AccountSlot uncategorizedAccountSlot = accountSlotRepository.findUncategorizedSlot(account).orElseThrow(() -> new AppException(ErrorCode.MISSING_UNCATEGORIZED_SLOT, "SlotService - 000"));
        uncategorizedAccountSlot.updateBudget(uncategorizedAccountSlot.getCurrentBudget()+accountSlot.getCurrentBudget());

        List<Transaction> transactions = transactionRepository.findByAccountSlot(accountSlot);
        for(Transaction transaction : transactions) {
            transaction.changeAccountSlot(uncategorizedAccountSlot);
        }

        accountSlot.getSlot().decreaseRank();
        accountSlotRepository.delete(accountSlot);

        // AccountSlot 삭제
        accountSlotRepository.deleteByUuid(accountSlotUuid);

        // dto 조립
        RemoveAccountSlotResponseDto removeAccountSlotResponseDto = RemoveAccountSlotResponseDto.builder()
                .success(true)
                .message("[SlotService - 011] 슬롯 삭제 성공")
                .data(RemoveAccountSlotResponseDto.Data.builder().accountSlotId(accountSlotUuid).build())
                .build();

        // 응답
        return removeAccountSlotResponseDto;
    }

    // 5-1-4
    public GetAccountSlotListResponseDto getAccountSlotList(Long userId, String accountUuid) {

        // userId != 조회한 account userId 이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 012]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 013]");
        }

        // AccountSlot 전체조회
        List<AccountSlot> accountSlotList = accountSlotRepository.findByAccount(account);

        // dto 조립
        // dto > data > slots
        List<GetAccountSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
        for(AccountSlot accountSlot : accountSlotList){

            // 기본 슬롯정보 담기 위해 slot 객체 얻기
            Slot slot = accountSlot.getSlot();

            // 초과지출 미리 계산
            Long exceededBudget = accountSlot.getSpent() - accountSlot.getCurrentBudget();
            if(exceededBudget < 0L) {
                exceededBudget = 0L;    // exceededBudget이 음수라면 0으로 처리
            }

            GetAccountSlotListResponseDto.SlotDto slotDto = GetAccountSlotListResponseDto.SlotDto.builder()
                    .slotId(slot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .accountSlotId(accountSlot.getUuid())
                    .isCustom(accountSlot.isCustom())
                    .customName(accountSlot.getCustomName())
                    .initialBudget(accountSlot.getInitialBudget())
                    .currentBudget(accountSlot.getCurrentBudget())
                    .spent(accountSlot.getSpent())
                    .remainingBudget(accountSlot.getCurrentBudget() - accountSlot.getSpent())
                    .isBudgetExceeded(accountSlot.isBudgetExceeded())
                    .exceededBudget(exceededBudget)
                    .budgetChangeCount(accountSlot.getBudgetChangeCount())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto 조립
        GetAccountSlotListResponseDto getAccountSlotListResponseDto = GetAccountSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 015] 계좌의 슬롯 리스트 조회 성공")
                .data(GetAccountSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getAccountSlotListResponseDto;
    }

    // 5-1-5
    public GetSlotHistoryResponseDto getSlotHistory(Long userId, String accountUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 016]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 017]");
        }

        // AccountSlot 객체 조회
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 019]"));

        // SlotHistory 전체조회
        List<SlotHistory> slotHistoryList = slotHistoryRepository.findByAccountSlot(accountSlot);

        // dto 조립
        // dto > data > slot
        GetSlotHistoryResponseDto.SlotDto slotDto = GetSlotHistoryResponseDto.SlotDto.builder()
                .slotId(accountSlot.getSlot().getUuid())
                .slotName(accountSlot.getSlot().getName())
                .isCustom(accountSlot.isCustom())
                .customName(accountSlot.getCustomName())
                .build();

        // dto > data > history
        List<GetSlotHistoryResponseDto.SlotHistoryDto>  slotHistoryDtoList = new ArrayList<>();
        for(SlotHistory slotHistory : slotHistoryList){
            GetSlotHistoryResponseDto.SlotHistoryDto slotHistoryDto = GetSlotHistoryResponseDto.SlotHistoryDto.builder()
                    .slotHistoryId(slotHistory.getUuid())
                    .oldBudget(slotHistory.getOldBudget())
                    .newBudget(slotHistory.getNewBudget())
                    .changedAt(slotHistory.getChangedAt())
                    .build();

            slotHistoryDtoList.add(slotHistoryDto);
        }

        // dto 조립
        GetSlotHistoryResponseDto getSlotHistoryResponseDto = GetSlotHistoryResponseDto.builder()
                .success(true)
                .message("[SlotService - 020] 슬롯 히스토리 전체조회 성공")
                .data(GetSlotHistoryResponseDto.Data.builder().slot(slotDto).history(slotHistoryDtoList).build())
                .build();

        // 응답
        return getSlotHistoryResponseDto;
    }

    // 5-2-1
    public RecommendSlotListResponseDto recommendSlotList(Long userId, String accountUuid, Short baseDay, String income, Short period) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 021]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "SlotService - 022");
        }

        // userKey, 나이 조회하기 위해 user 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 023]"));
        String userKey = user.getUserKey();

        // baseDay 저장
        user.updateBaseDay(baseDay);

        // period 기간동안의 거래내역 조회하기
        // SSAFY 금융 API >>>>> 2.4.12 계좌 거래 내역 조회
        // 요청보낼 url
        String url1 = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList";

        // Header 만들기
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
        System.out.println("transmissionDate: " + formattedDateTime.get("date"));
        System.out.println("transmissionTime: " + formattedDateTime.get("time"));
        Header header = Header.builder()
                .apiName("inquireTransactionHistoryList")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionTime(formattedDateTime.get("time"))
                .apiServiceCode("inquireTransactionHistoryList")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(userKey)
                .build();

        // body 만들기
        Map<String, Object> body1 = new HashMap<>();
        body1.put("Header", header);
        try {
            body1.put("accountNo", AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey));
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 024]");
        }

        Map<String, String> date = LocalDateTimeFormatter.fomatterWithMonthsAgo(period);
        System.out.println("dateWithMonthsAgo:" + date.get("dateMonthsAgo"));
        body1.put("startDate", date.get("dateMonthsAgo"));
        body1.put("endDate", date.get("date"));
        body1.put("transactionType", "D");
        body1.put("orderByType", "ASC");

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity1 = new HttpEntity<>(body1);

        // 요청 보내기
        ResponseEntity<SSAFYGetTransactionListResponseDto> httpResponse1 = restTemplate.exchange(
                url1,
                HttpMethod.POST,
                httpEntity1,
                SSAFYGetTransactionListResponseDto.class
        );

        // gpt한테 보내기 위해 우리 서비스 slot 전체조회
        List<Slot> slotList = slotRepository.findAll();
        List<SlotDto> slotDtoList1 = new ArrayList<>();
        for(Slot slot : slotList){
            SlotDto slotDto = SlotDto.builder()
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .build();

            slotDtoList1.add(slotDto);
        }

        // gpt한테 보내기 위해 거래내역 dto와 slot 리스트를 json으로 직렬화
        ObjectMapper objectMapper = new ObjectMapper();
        String transactionData = null;
        String slotListData = null;
        try {
            transactionData = objectMapper.writeValueAsString(httpResponse1.getBody().getREC().getList());
            slotListData = objectMapper.writeValueAsString(slotDtoList1);
        } catch(Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "SlotService - 025");
        }

        // gpt한테 요청보내기
        // SSAFY GMS >>>>> gpt-5-nano
        // body 만들기
        // body > messages
        List<ChatGPTRequestDto.Message> messages = new ArrayList<>();

        ChatGPTRequestDto.Message message1 = ChatGPTRequestDto.Message.builder()
                .role("developer")
                .content("""
                        너는 개인 예산 관리 서비스를 위한 추천 엔진 역할을 해.
                        나는 최근 3개월간의 계좌 거래내역과 우리 서비스에서 제공하는 슬롯 리스트를 JSON 형태로 제공할거야.
                        """)
                .build();
        messages.add(message1);

        // user 프롬프트 만들기
        String userPrompt = String.format("""
        [요구사항]
        1. 거래내역을 분석해서 사용자의 소비 패턴을 파악해줘.
        2. 제공된 슬롯 리스트 중 어떤 슬롯을 이 사용자가 가지면 좋을지 추천해줘.
        3. 각 슬롯별로 적절한 예산 금액을 배정해줘.
        4. 내가 제공한 슬롯 리스트 중 그 어디에도 어울리지 않는 지출이 있다면 미분류 슬롯에 배정하면 돼.
        5. 추천 근거는 다음과 같아. %d개월 치 거래내역을 1개월 단위로 분석해.
           분석 방법은 다음과 같아. 내가 제공한 슬롯 리스트를 보고 각 거래내역마다 어느 슬롯이 적합한지 추론해.
           그리고 한달 치 거래내역에 대해 각 슬롯마다의 합계를 계산해. 이것을 %d달치 거래내역에 대해 반복한 후,
           각 슬롯별로 %d달치 금액의 평균을 계산해.
           그렇게 계산된 각 슬롯에 대한 %d개월 치 평균 금액이 최종 추천 슬롯 리스트의 추천 예산 금액이 될거야.
        6. 만약 거래내역이 없다면 주어진 나이와 수입구간을 참고해서 일반적인 슬롯리스트를 만들고 예산을 편성해줘.
        7. 니가 편성한 모든 슬롯리스트의 예산은 주어진 income 수준에 적절해야 해.
        8. 최종 결과는 JSON 형태로만 반환해줘. 반환할 때는 그 어떤 인사말이나 멘트도 포함하지 않은 채로 그냥 JSON만 반환해.
        
        [입력 데이터]
        "transactions" : %s,
        "age" : %d,
        "income" : %s,
        
        [슬롯 리스트]
        "slots": "%s"
        
        [반환 데이터 예시]
        {
            "recommendedSlots": [
                { "name": "식비", "initialBudget": 350000 },
                { "name": "교통비", "initialBudget": 50000 },
                { "name": "카페/간식", "initialBudget": 100000 },
                { "name": "저축", "initialBudget": 250000 },
                { "name": "구독비", "initialBudget": 150000 }
            ]
        }
        """,
                period, period, period, period,
                transactionData,
                LocalDateTimeFormatter.calculateAge(user.getBirthDate()),
                incomes.get(income),
                slotListData
        );

        ChatGPTRequestDto.Message message2 = ChatGPTRequestDto.Message.builder()
                .role("user")
                .content(userPrompt)
                .build();
        messages.add(message2);

        ChatGPTRequestDto body2 = ChatGPTRequestDto.builder()
                .model("gpt-5-nano")
                .messages(messages)
                .build();

        // 요청보내기
        ChatGPTResponseDto httpResponse2 = callGMS(body2);

        // gpt로부터 받은 응답 역직렬화
        JsonNode node;
        List<ChatGPTResponseDto.RecommendedSlotDto> recommendedSlots;
        try {
            node = objectMapper.readTree(httpResponse2.getChoices().get(0).getMessage().getContent());
            JsonNode slotsNode = node.get("recommendedSlots");

            recommendedSlots = objectMapper.readValue(
                    slotsNode.toString(),
                    new TypeReference<List<ChatGPTResponseDto.RecommendedSlotDto>>(){}
            );
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 026]");
        }

        // dto 조립
        // dto > data > bank
        RecommendSlotListResponseDto.BankDto bankDto = RecommendSlotListResponseDto.BankDto.builder()
                .bankId(account.getBank().getUuid())
                .name(account.getBank().getName())
                .color(account.getBank().getColor())
                .build();

        // dto > data > account
        RecommendSlotListResponseDto.AccountDto accountDto;
        try {
            accountDto = RecommendSlotListResponseDto.AccountDto.builder()
                    .accountId(account.getUuid())
                    .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                    .accountBalance(account.getBalance())
                    .build();
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 027]");
        }

        // dto > data > recommendedSlots
        List<RecommendSlotListResponseDto.SlotDto> slotDtoList2 = new ArrayList<>();
        for(ChatGPTResponseDto.RecommendedSlotDto recommendedSlotDto : recommendedSlots) {

            // gpt가 준 이름 기준으로 slot 조회
            Slot slot = slotRepository.findByName(recommendedSlotDto.getName());

            // 조회된 슬롯이 없다면 그냥 넘어가기
            if(slot == null) {
                continue;
            }

            // 조회된 슬롯이 있다면 dto 조립
            RecommendSlotListResponseDto.SlotDto slotDto = RecommendSlotListResponseDto.SlotDto.builder()
                    .slotId(slot.getUuid())
                    .name(slot.getName())
                    .initialBudget(recommendedSlotDto.getInitialBudget())
                    .build();

            slotDtoList2.add(slotDto);
        }

        // dto 조립
        RecommendSlotListResponseDto recommendSlotListResponseDto = RecommendSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 028] 슬롯 추천 성공")
                .data(RecommendSlotListResponseDto.Data.builder().bank(bankDto).account(accountDto).recommededSlots(slotDtoList2).build())
                .build();

        // 응답
        return recommendSlotListResponseDto;
    }

    // 5-2-1에서 ChatGPT 호출할 때 쓸 메서드
    private ChatGPTResponseDto callGMS(ChatGPTRequestDto body) {
        return ssafyGmsWebClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(ChatGPTResponseDto.class)
                .block();
    }

    // 5-2-2
    public AddSlotListResponseDto addSlots(Long userId, String accountUuid, List<AddSlotListRequestDto.SlotDto> requestSlotDtos) {

        // user 조회 (없으면 404)
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "SlotService - 029"));

        // account 조회 (없으면 404)
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND, "SlotService - 030"));

        // userId != 요청한 계좌 userId 이면 403
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "SlotService - 031");
        }

        // 슬롯 중복검사하기 위해서 미리 이 계좌에 등록돼있는 슬롯 UUID Set 만들어두기
        Set<String> existingSlotUuids = accountSlotRepository.findSlotUuidsByAccountUuid(accountUuid);

        // slotDto 돌면서 존재 안하는 slotUuid 있으면 404
        // 추가하려는 슬롯의 initialBudget합을 저장할 변수와 응답할 때 쓸 SlotDtoList 미리 만들어두기 (initialBudget 누적합이 기존 미분류 슬롯 잔액을 넘으면 안됨)
        Long initialBudgetSum = 0L;
        List<AddSlotListResponseDto.SlotDto> responseSlotDtos = new ArrayList<>();
        for(AddSlotListRequestDto.SlotDto requestSlotDto : requestSlotDtos){

            // 이미 있는 slot 추가하려고 할때 409 (위에서 만들어둔 existingAccountSlotUuids 활용)
            if(existingSlotUuids.contains(requestSlotDto.getSlotId())) {
                throw new AppException(ErrorCode.CONFLICT, "SlotService - 032");
            }

            // initialBudgetSum에 누적합
            initialBudgetSum += requestSlotDto.getInitialBudget();

            // slot 조회 (없으면 404)
            Slot slot = slotRepository.findByUuid(requestSlotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND, "[SlotService - 033]"));

            // AccountSlot 객체 만들기
            AccountSlot accountSlot = AccountSlot.builder()
                    .account(account)
                    .slot(slot)
                    .isCustom(requestSlotDto.isCustom())
                    .customName(requestSlotDto.getCustomName())
                    .initialBudget(requestSlotDto.getInitialBudget())
                    .currentBudget(requestSlotDto.getInitialBudget())
                    .build();

            // DB에 저장
            accountSlotRepository.save(accountSlot);

            // dto 조립
            // dto > data > slots
            AddSlotListResponseDto.SlotDto responseSlotDto = AddSlotListResponseDto.SlotDto.builder()
                    .accountSlotId(accountSlot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .isCustom(requestSlotDto.isCustom())
                    .customName(requestSlotDto.getCustomName())
                    .initialBudget(requestSlotDto.getInitialBudget())
                    .build();

            responseSlotDtos.add(responseSlotDto);
        } // 추가요청받은 슬롯 리스트 추가 완료

        // initialBudgetSum > 미분류 슬롯 잔액인지 검사
        // 일단 미분류 슬롯 찾기
        Slot uncategorizedSlot = slotRepository.findById(0L).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "SlotService - 034"));
        AccountSlot uncategorizedAccountSlot = accountSlotRepository.findByAccountAndSlot(account, uncategorizedSlot).orElseThrow(() -> new AppException(ErrorCode.MISSING_UNCATEGORIZED_SLOT, "SlotService - 035"));
        if(initialBudgetSum > uncategorizedAccountSlot.getCurrentBudget() - uncategorizedAccountSlot.getSpent()) {
            throw new AppException(ErrorCode.ALLOCATABLE_BUDGET_EXCEEDED, "SlotService - 034");
        }

        // dto 조립
        AddSlotListResponseDto addSlotListResponseDto = AddSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 035] 슬롯 추가 성공")
                .data(AddSlotListResponseDto.Data.builder().slots(responseSlotDtos).build())
                .build();

        // 응답
        return addSlotListResponseDto;
    }

    // 5-2-3
    public ModifyAccountSlotListResponseDto modifyAccountSlots(Long userId, String accountUuid, List<ModifyAccountSlotListRequestDto.SlotDto> slotDtos) {

        // userId != account userId이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 036]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "SlotService - 037");
        }

        // 이 account의 accountSlot 리스트
        List<AccountSlot> accountsSlots = account.getAccountSlots();

        // 원래 쓰던 슬롯인지 검사하가 위해서 기존 슬롯들의 Uuid Set 미리 만들어두기
        Set<String> existingSlotUuids = accountSlotRepository.findSlotUuidsByAccountUuid(accountUuid);

        Long budgetLimit = 0L; // 할당가능예산 (상황에 따라 측정 로직은 다름)
        Long budgetAmount = 0L; // initialBudget의 총합
        Long increaseBudgetAmount = 0L; // 늘린 budget의 총합
        List<ModifyAccountSlotListResponseDto.SlotDto> responseSlotDtos = new ArrayList<>(); // 응답 DTO > data

        if(accountsSlots.size() == 0) { // 최초 슬롯리스트 등록이라면...

            budgetLimit = account.getBalance(); // 할당가능 예산이 계좌잔액이 됨

            for(ModifyAccountSlotListRequestDto.SlotDto slotDto : slotDtos) {

                budgetAmount += slotDto.getInitialBudget(); // 할당 예산 누적합

                Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND, "SlotService - 037"));
                AccountSlot accountSlot = AccountSlot.builder() // AccountSlot 객체 만들고 저장
                        .account(account)
                        .slot(slot)
                        .initialBudget(slotDto.getInitialBudget())
                        .currentBudget(slotDto.getInitialBudget())
                        .isCustom(slotDto.isCustom())
                        .customName(slotDto.getCustomName())
                        .build();

                accountSlotRepository.save(accountSlot);
                slot.increaseRank(); // 슬롯 사용했으니 rank++

                // 응답 DTO
                ModifyAccountSlotListResponseDto.SlotDto responseSlotDto = ModifyAccountSlotListResponseDto.SlotDto.builder()
                        .accountSlotId(accountSlot.getUuid())
                        .name(slot.getName())
                        .isSaving(slot.isSaving())
                        .isCustom(slotDto.isCustom())
                        .customName(slotDto.getCustomName())
                        .initialBudget(slotDto.getInitialBudget())
                        .build();

                responseSlotDtos.add(responseSlotDto);
            }

            // 할당 예산 총액 > 계좌 잔액 인지 검사
            if(budgetAmount > budgetLimit) {
                throw new AppException(ErrorCode.THRIFT_BUDGET_EXCEEDED, "SlotService - 039");
            }

        } else { // 기준일이라면

            // budgetLimit 구하기
            List<AccountSlot> accountSlots = accountSlotRepository.findByAccount(account);
            for(AccountSlot accountSlot : accountSlots) {
                if(accountSlot.getCurrentBudget() > accountSlot.getSpent()) {
                    budgetLimit += (accountSlot.getCurrentBudget() - accountSlot.getSpent());
                }
            }

            // AccountSlot 객체들 만들어서 저장하기
            for(ModifyAccountSlotListRequestDto.SlotDto slotDto : slotDtos) {
                Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND, "SlotService - 037"));
                if(existingSlotUuids.contains(slot.getUuid())) { // 만약 기존에 있던 슬롯인데 기존의 currentBudget보다 예산을 늘린다면 예산을 늘린다고 판단하고 추가예산 총합계산
                    AccountSlot existingAccountSlot = accountSlotRepository.findByAccountAndSlot(account, slot).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_SLOT_NOT_FOUND, "SlotService - 037"));
                    if(slotDto.getInitialBudget() > existingAccountSlot.getCurrentBudget()) { // 이러면 예산 늘리려는 슬롯인 것
                        increaseBudgetAmount += (slotDto.getInitialBudget() - existingAccountSlot.getCurrentBudget()); // 늘리려는 예산 총합에 누적
                    }
                }

                AccountSlot accountSlot = AccountSlot.builder()
                        .account(account)
                        .slot(slot)
                        .initialBudget(slotDto.getInitialBudget())
                        .currentBudget(slotDto.getInitialBudget())
                        .isCustom(slotDto.isCustom())
                        .customName(slotDto.getCustomName())
                        .build();

                accountSlotRepository.save(accountSlot);
                slot.increaseRank();

                budgetAmount += slotDto.getInitialBudget();

                // 응답 DTO
                ModifyAccountSlotListResponseDto.SlotDto responseSlotDto = ModifyAccountSlotListResponseDto.SlotDto.builder()
                        .accountSlotId(accountSlot.getUuid())
                        .name(slot.getName())
                        .isSaving(slot.isSaving())
                        .isCustom(slotDto.isCustom())
                        .customName(slotDto.getCustomName())
                        .initialBudget(slotDto.getInitialBudget())
                        .build();

                responseSlotDtos.add(responseSlotDto);
            }

            // 예산 늘어난 금액 > 지난달 절약금액 검사
            if(increaseBudgetAmount > budgetLimit) {
                throw new AppException(ErrorCode.THRIFT_BUDGET_EXCEEDED, "SlotService - 039");
            }
        }

        // 미분류 슬롯 만들어주기 (사용자가 일부러 선택하지 X)
        Slot uncategorizedSlot = slotRepository.findById(0L).orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND, "SlotService - 037"));
        AccountSlot uncategorizedAccountSlot = AccountSlot.builder()
                .account(account)
                .slot(uncategorizedSlot)
                .initialBudget(account.getBalance() - budgetAmount)
                .currentBudget(account.getBalance() - budgetAmount)
                .isCustom(false)
                .customName(null)
                .build();

        accountSlotRepository.save(uncategorizedAccountSlot);

        // dto 조립
        ModifyAccountSlotListResponseDto modifyAccountSlotResponseDto = ModifyAccountSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 040] 다음달 슬롯 리스트 등록 성공")
                .data(ModifyAccountSlotListResponseDto.Data.builder().slots(responseSlotDtos).build())
                .build();

        // 응답
        return modifyAccountSlotResponseDto;
    }
}
