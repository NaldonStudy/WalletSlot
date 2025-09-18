package com.ssafy.b108.walletslot.backend.domain.account.service;

import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.domain.account.Account;
import com.ssafy.b108.walletslot.backend.domain.account.dto.GetLinkedAccountListResponse;
import com.ssafy.b108.walletslot.backend.domain.account.external.SSAFYGetAccountListResponse;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.account.dto.AccountDto;
import com.ssafy.b108.walletslot.backend.domain.account.dto.GetAccountListResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpHeaders;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    // Field
    private final AccountRepository accountRepository;

    @Value("${api.ssafy.finance.apiKey}")
    private String ssafyFinanceApiKey;

    @Value("${api.ssafy.finance.userKey}")
    private String ssafyFinanceUserKey;

    private final RestTemplate restTemplate;

    // Method
    // 4-1-1
    public GetAccountListResponse getAccountList(Long userId) {

        // 싸피 금융 API에 요청보낼 바디 만들기
        // 현재 로그인된 사용자의 userId 획득 -> DB에서 이 userId를 가지는 사용자의 이메일 조회 -> 싸피 금융 api에 userKey 요청 -> 획득 후 헤더에 userKey 포함해서 요청보내야함
        // 지금은 더미데이터 v1의 userKey로 사용
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter(LocalDateTime.now());
        Header header = Header.builder()
                .apiName("inquireDemandDepositAccountList")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionDate(formattedDateTime.get("time"))
                .apiServiceCode("inquireDemandDepositAccountList")
                .institutionTransactionUniqueNo(formattedDateTime.get("date")+formattedDateTime.get("time")+ RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(ssafyFinanceUserKey)
                .build();

        Map<String, Object> body = new HashMap<>();
        body.put("Header", header);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body);

        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountList";

        ResponseEntity<SSAFYGetAccountListResponse> httpResponse = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity,
                SSAFYGetAccountListResponse.class
        );

    }

    // 4-1-2
    public GetLinkedAccountListResponse getLinkedAccounts(Long userId) {
        // 레포에서 이 사용자의 모든 계좌 가져오기
        // dto 조립해서 컨트롤러에 반환
        List<Account> accountList = accountRepository.findByUserId(userId);

        // 사용할 dto 변수 미리 선언
        GetLinkedAccountListResponse getLinkedAccountListResponse;

        // 조회된 게 없으면 바로 응답
        if(accountList.isEmpty()){
            getLinkedAccountListResponse = GetLinkedAccountListResponse.builder()
                    .success(true)
                    .message("[AccountService - 000] 연동계좌 조회 성공")
                    .build();

            return getLinkedAccountListResponse;
        }

        // dto 조립
        // dto > data > accounts
        List<AccountDto> accountDtoList = accountRepository.findByUserId(userId).stream()
                .map(account -> AccountDto.builder()
                        .accountNo(account.getEncryptedAccountNo())
                        .bankName(account.getBank().getName())
                        .bankCode(account.getBank().getCode())
                        .build())
                .toList();

        // dto
        getLinkedAccountListResponse = GetLinkedAccountListResponse.builder()
                .success(true)
                .message("[AccountService - 000] 연동계좌 조회 성공")
                .data(GetLinkedAccountListResponse.Data.builder().accounts(accountDtoList).build())
                .build();

        return getLinkedAccountListResponse;
    }
}
