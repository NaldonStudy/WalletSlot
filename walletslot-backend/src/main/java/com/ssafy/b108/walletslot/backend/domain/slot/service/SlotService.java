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
import com.ssafy.b108.walletslot.backend.domain.slot.dto.*;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.ChatGPTRequestDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.ChatGPTResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.external.SSAFYGetTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotHistoryRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
                    .color(slot.getColor())
                    .icon(slot.getIcon())
                    .rank(slot.getRank())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto
        GetSlotListResponseDto getSlotListResponseDto = GetSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 슬롯 전체조회 성공")
                .data(GetSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getSlotListResponseDto;
    }

    // 5-1-4
    public GetAccountSlotListResponseDto getAccountSlotList(Long userId, String accountUuid) {

        // userId != 조회한 account userId 이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // AccountSlot 전체조회
        List<AccountSlot> accountSlotList = accountSlotRepository.findByAccount(account).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // dto 조립
        // dto > data > slots
        List<GetAccountSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
        for(AccountSlot accountSlot : accountSlotList){

            // 기본 슬롯정보 담기 위해 slot 객체 얻기
            Slot slot = accountSlot.getSlot();

            GetAccountSlotListResponseDto.SlotDto slotDto = GetAccountSlotListResponseDto.SlotDto.builder()
                    .slotId(slot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .icon(slot.getIcon())
                    .color(slot.getColor())
                    .accountSlotId(accountSlot.getUuid())
                    .isCustom(accountSlot.isCustom())
                    .customName(accountSlot.getCustomName())
                    .initialBudget(accountSlot.getInitialBudget())
                    .currentBudget(accountSlot.getCurrentBudget())
                    .spent(accountSlot.getSpent())
                    .remainingBudget(accountSlot.getCurrentBudget() - accountSlot.getSpent())
                    .isBudgetExceeded(accountSlot.isBudgetExceeded())
                    .exceededBudget(accountSlot.getSpent() - accountSlot.getCurrentBudget())
                    .budgetChangeCount(accountSlot.getBudgetChangeCount())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto 조립
        GetAccountSlotListResponseDto getAccountSlotListResponseDto = GetAccountSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 계좌의 슬롯 리스트 조회 성공")
                .data(GetAccountSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getAccountSlotListResponseDto;
    }

    // 5-2-1
    public RecommendSlotListResponseDto recommendSlotList(Long userId, String accountUuid, Short baseDay, String income, Short period) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // userKey, 나이 조회하기 위해 user 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService]"));
        String userKey = user.getUserKey();
        
        // baseDay 저장
        user.updateBaseDay(baseDay);

        // 거래내역 세달치 조회하기
        // SSAFY 금융 API >>>>> 2.4.12 계좌 거래 내역 조회
        // 요청보낼 url
        String url1 = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList";

        // Header 만들기
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
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
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 000]");
        }
        Map<String, String> date = LocalDateTimeFormatter.fomatterWithMonthsAgo(period);
        body1.put("startDate", date.get("dateWithMothsAgo"));
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

        // gpt한테 보내기 위해 거래내역 dto와 slot 리스트를 json으로 직렬화
        ObjectMapper objectMapper = new ObjectMapper();
        String transactionData = null;
        String slotListData = null;
        try {
            transactionData = objectMapper.writeValueAsString(httpResponse1.getBody().getREC().getList());
            slotListData = objectMapper.writeValueAsString(slotList);
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 000]");
        }

        // gpt한테 요청보내기
        // SSAFY GMS >>>>> gpt-5-nano
        // 요청보낼 url
        String url2 = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions";

        // header 만들기
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(ssafyGmsKey);

        // body 만들기
        // body > messages
        List<ChatGPTRequestDto.Message> messages = new ArrayList<>();

        ChatGPTRequestDto.Message message1 = ChatGPTRequestDto.Message.builder()
                .role("system")
                .content("""
                        너는 개인 예산 관리 서비스를 위한 추천 엔진 역할을 해.
                        나는 최근 3개월간의 계좌 거래내역과 우리 서비스에서 제공하는 슬롯 리스트를 JSON 형태로 제공할거야.
                        """)
                .build();
        messages.add(message1);

        ChatGPTRequestDto.Message message2 = ChatGPTRequestDto.Message.builder()
                .role("user")
                .content("""
                        [요구사항]
                        1. 거래내역을 분석해서 사용자의 소비 패턴을 파악해줘.
                        2. 제공된 슬롯 리스트 중 어떤 슬롯을 이 사용자가 가지면 좋을지 추천해줘.
                        3. 각 슬롯별로 적절한 예산 금액을 배정해줘.
                        4. 내가 제공한 슬롯 리스트 중 그 어디에도 어울리지 않는 지출이 있다면 미분류 슬롯에 배정하면 돼.
                        5. 추천 근거는 다음과 같아."""
                        + period +
                        """
                        개월 치 거래내역을 1개월 단위로 분석해. 분석 방법은 다음과 같아. 내가 제공한 슬롯 리스트를 보고 각 거래내역마다 어느 슬롯이 적합한지 추론해. 그리고 한달 치 거래내역에 대해 각 슬롯마다의 합계를 계산해. 이것을 3달치 거래내역에 대해 반복한 후, 각 슬롯별로
                        """
                        + period +
                        """
                        달치 금액의 평균의 계산해. 그렇게 계산된 각 슬롯에 대한
                        """
                        + period +
                        """
                        개월 치 평균 금액이 최종 추천 슬롯 리스트의 추천 예산 금액이 될거야.
                        6. 만약 거래내역이 없다면 주어진 나이와 수입구간을 참고해서 일반적인 슬롯리스트를 만들고 예산을 편성해줘.
                        7. 니가 편성한 모든 슬롯리스트의 예산은 주어진 income 수준에 적절해야 해.
                        8. 최종 결과는 JSON 형태로만 반환해줘. 반환할 때는 그 어떤 인사말이나 멘트도 포함하지 않은 채로 그냥 JSON만 반환해.
                        
                        [입력 데이터]
                        "transactions" :
                        """
                        + transactionData +
                        """
                        ,"age" :
                        """
                        + LocalDateTimeFormatter.calculateAge(user.getBirthDate()) +
                        """
                        ,"income" :
                        """
                        + incomes.get(income) +
                        """
                        [슬롯 리스트]
                        "slots" :
                        """
                        + slotListData + """
                
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
                        """)
                .build();
        messages.add(message2);

        ChatGPTRequestDto body2 = ChatGPTRequestDto.builder()
                .model("gpt-5-nano")
                .messages(messages)
                .build();

        // 요청보낼 http entity 만들기
        HttpEntity<ChatGPTRequestDto> httpEntity2 = new HttpEntity<>(body2, headers);

        // 요청 보내기
        ResponseEntity<ChatGPTResponseDto> httpResponse2 = restTemplate.exchange(
                url2,
                HttpMethod.POST,
                httpEntity2,
                ChatGPTResponseDto.class
        );

        // gpt로부터 받은 응답 역직렬화
        JsonNode node;
        List<ChatGPTResponseDto.RecommendedSlotDto> recommendedSlots;
        try {
            node = objectMapper.readTree(httpResponse2.getBody().getChoices().get(0).getMessage().getContent());
            JsonNode slotsNode = node.get("recommendedSlots");

            recommendedSlots = objectMapper.readValue(
                    slotsNode.toString(),
                    new TypeReference<List<ChatGPTResponseDto.RecommendedSlotDto>>() {}
            );
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 000]");
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
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 000]");
        }

        // dto > data > recommendedSlots
        List<RecommendSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
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

            slotDtoList.add(slotDto);
        }

        // dto 조립
        RecommendSlotListResponseDto recommendSlotListResponseDto = RecommendSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 슬롯 추천 성공")
                .data(RecommendSlotListResponseDto.Data.builder().bank(bankDto).account(accountDto).recommededSlots(slotDtoList).build())
                .build();

        // 응답
        return recommendSlotListResponseDto;
    }

    // 5-2-2
    public AddSlotListResponseDto addSlotList(Long userId, String accountUuid, List<AddSlotListRequestDto.SlotDto> slotDtoList) {

        // user 조회 (없으면 404)
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // account 조회 (없으면 404)
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // userId != 요청한 계좌 userId 이면 403
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // 슬롯 중복검사하기 위해서 미리 이 계좌에 등록돼있는 슬롯 UUID Set 만들어두기
        List<AccountSlot> accountSlotList = account.getAccountSlots();
        Set<String> slotUuidList = new HashSet<>();
        for(AccountSlot accountSlot : accountSlotList){
           slotUuidList.add(accountSlot.getSlot().getUuid());
        }

        // accountSlotList.size() == 0 이면 최초 슬롯등록 / > 0 이면 슬롯추가
        boolean isInitial = true;

        // 등록하려는 슬롯들의 initialBudget 총합과 비교해야하는 값
        // 최초라면 그대로 두고, 최초가 아니라면 아래 로직에 의해 바뀜
        Long budgetLimit = account.getBalance();

        if(!slotDtoList.isEmpty()){
            isInitial = false;

            Long nonExceededSlotsRemainingSum = null;
            for(AccountSlot accountSlot : accountSlotList) {
                if(!accountSlot.isBudgetExceeded()) {
                    nonExceededSlotsRemainingSum += (accountSlot.getCurrentBudget() - accountSlot.getSpent());
                }
            }

            budgetLimit -= nonExceededSlotsRemainingSum;
        }

        // 등록하려는 슬롯들의 initialBudget 총합을 저장할 변수
        Long initialBudgetSum = null;

        // slotDto 돌면서 존재 안하는 slot 있으면 404
        // 응답할 때 쓸 SlotDtoList 미리 만들어두기
        List<AddSlotListResponseDto.SlotDto> slotDtoList2 = new ArrayList<>();
        for(AddSlotListRequestDto.SlotDto slotDto : slotDtoList){

            // 이미 있는 slot 추가하려고 할때 409 (위에서 만들어둔 slotUuidList 활용)
            if(slotUuidList.contains(slotDto.getSlotId())) {
                throw new AppException(ErrorCode.CONFLICT, "[SlotService - 000]");
            }

            // initialBudgetSum에 누적합
            initialBudgetSum += slotDto.getInitialBudget();

            // slot 조회 (없으면 404)
            Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

            // AccountSlot 객체 만들기
            AccountSlot accountSlot = AccountSlot.builder()
                    .account(account)
                    .slot(slot)
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            // DB에 저장
            accountSlotRepository.save(accountSlot);

            // dto 조립
            // dto > data > slots
            AddSlotListResponseDto.SlotDto slotDto2 = AddSlotListResponseDto.SlotDto.builder()
                    .accountSlotId(accountSlot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            slotDtoList2.add(slotDto2);
        } // 추가요청받은 슬롯 리스트 추가 완료

        // initialBudgetSum <= budgetLimit 검사
        if(initialBudgetSum >  budgetLimit) {
            throw new AppException(ErrorCode.ALLOCATABLE_BUDGET_EXCEEDED, "[SlotService - 000]");
        }

        // dto 조립
        AddSlotListResponseDto addSlotListResponseDto = AddSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 슬롯 추가 성공")
                .data(AddSlotListResponseDto.Data.builder().slots(slotDtoList2).build())
                .build();

        // 응답
        return addSlotListResponseDto;
    }

    // 5-2-3
    public ModifyAccountSlotResponseDto modifyAccountSlot(Long userId, String accountUuid, List<ModifyAccountSlotRequestDto.SlotDto> slotDtoList) {

        // userId != account userId이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // 이 account 기준으로 accountSlot 조회해서 isExceeded == false 인거 있으면 절약금액 총합 누적
        List<AccountSlot> accountSlotList = account.getAccountSlots();
        Long savingAmount = 0L;
        for(AccountSlot accountSlot : accountSlotList){

            // 기존 SlotHistory 전부 삭제 (for문 도는 김에 이 안에서 삭제)
            slotHistoryRepository.deleteByAccountSlot(accountSlot);

            // 예산을 절약해서 사용한 슬롯이 있다면 절약 금액에 누적합
            if(!accountSlot.isBudgetExceeded()) {
                savingAmount += (accountSlot.getInitialBudget() - accountSlot.getSpent());
            }
        }

        // 기존 AccountSlot들 전부 삭제 (만약 기준에 부합하지 않아서 메서드가 끝나기 전에 예외가 터지면, 롤백될 것이므로 괜찮음)
        accountSlotRepository.deleteByAccount(account);

        // slotDtoList 돌면서 이전에도 있던 슬롯이면(slotId 받은거 기준으로 조회) initialBudget 기준으로 예산 늘리는 건지 계산
        // 늘리는 거면 늘린 예산 총합에 누적
        Long additionalBudget = 0L;

        // 응답 dto에 들어갈 SlotDto 리스트
        List<ModifyAccountSlotResponseDto.SlotDto> slotDtoList2 = new ArrayList<>();

        for(ModifyAccountSlotRequestDto.SlotDto slotDto : slotDtoList){

            // 기존에 있던 슬롯인지 검사
            for(AccountSlot accountSlot : accountSlotList) {
                if(accountSlot.getSlot().getUuid().equals(slotDto.getSlotId())) {

                    // 있던 슬롯이면 예산을 줄이는건지 늘리는 건지 검사
                    if(slotDto.getInitialBudget() > accountSlot.getInitialBudget()) {

                        // 늘리는 거면 addtionalBudget에 누적합
                        additionalBudget += (slotDto.getInitialBudget() - accountSlot.getInitialBudget());
                    }
                    // 기존에 있던 슬롯의 예산을 줄이는 경우는 고려하지 않음.
                    // 예산을 줄일 슬롯이 지난달에 절약한 슬롯과 겹칠 경우, 둘 중 하나만 반영해야 하는데 그러면 사용자가 헷갈릴 것 같아서 고려하지 X
                    // 무조건 지난달에 절약한 만큼만 늘릴 수 있도록.
                }
            }

            // AccountSlot 객체 만들어서 save.
            // AccountSlot 객체에 넣을 Slot 객체 먼저 조회
            Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

            // AccountSlot 객체 만들기
            AccountSlot accountSlot = AccountSlot.builder()
                    .account(account)
                    .slot(slot)
                    .initialBudget(slotDto.getInitialBudget())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .build();

            // 저장
            accountSlotRepository.save(accountSlot);

            // 응답 dto 조립
            // dto > data > slots
            ModifyAccountSlotResponseDto.SlotDto slotDto2 = ModifyAccountSlotResponseDto.SlotDto.builder()
                    .accountSlotId(accountSlot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            slotDtoList2.add(slotDto2);
        } // 요청받은 슬롯들에 대해 전부 돌면서 저장 완료

        // 마지막에 절약금액 >= 늘린예산 인지 검사 (아니면 THRIFT_BUDGET_EXCEEDED 발생 시키기)
        if(savingAmount < additionalBudget) {
            throw new AppException(ErrorCode.THRIFT_BUDGET_EXCEEDED, "[SlotService - 000]");
        }

        // dto 조립
        ModifyAccountSlotResponseDto modifyAccountSlotResponseDto = ModifyAccountSlotResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 다음달 슬롯 리스트 등록 성공")
                .data(ModifyAccountSlotResponseDto.Data.builder().slots(slotDtoList2).build())
                .build();

        // 응답
        return modifyAccountSlotResponseDto;
    }

}
