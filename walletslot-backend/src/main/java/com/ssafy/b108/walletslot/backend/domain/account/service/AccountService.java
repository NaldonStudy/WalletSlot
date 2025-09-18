package com.ssafy.b108.walletslot.backend.domain.account.service;

import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.domain.account.dto.*;
import com.ssafy.b108.walletslot.backend.domain.account.dto.external.SSAFYRequestVerificationResponseDto;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.dto.external.SSAFYGetAccountListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
    public GetAccountListResponseDto getAccountList(Long userId) {

        // 싸피 금융 API에 요청보낼 바디 만들기
        // 현재 로그인된 사용자의 userId 획득 -> DB에서 이 userId를 가지는 사용자의 이메일 조회 -> 싸피 금융 api에 userKey 요청 -> 획득 후 헤더에 userKey 포함해서 요청보내야함
        // 지금은 더미데이터 v1의 userKey로 사용

        // 요청보낼 url
        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountList";
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter(LocalDateTime.now());
        Header header = Header.builder()
                .apiName("inquireDemandDepositAccountList")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionDate(formattedDateTime.get("time"))
                .apiServiceCode("inquireDemandDepositAccountList")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(ssafyFinanceUserKey)
                .build();

        Map<String, Object> body = new HashMap<>();
        body.put("Header", header);

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body);

        // 요청 보내기
        ResponseEntity<SSAFYGetAccountListResponseDto> httpResponse = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity,
                SSAFYGetAccountListResponseDto.class
        );

        // SSAFY 금융망 API로부터 받은 응답 가지고 dto 조립
        // dto > data > accounts
        List<AccountDto> accountDtoList = httpResponse.getBody().getREC().stream().map(account -> AccountDto.builder()
                        .accountNo(account.getAccountNo())
                        .bankName(account.getBankName())
                        .bankCode(account.getBankCode())
                        .build())
                .toList();

        // dto
        GetAccountListResponseDto getAccountListResponseDto = GetAccountListResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 마이데이터 연동 성공")
                .data(GetAccountListResponseDto.Data.builder().accounts(accountDtoList).build())
                .build();

        // 응답
        return getAccountListResponseDto;
    }

    // 4-1-2
    public GetLinkedAccountListResponseDto getLinkedAccounts(Long userId) {

        // 현재 사용자의 userId != userId 이면 403
        // user테이블 돌았을 때, 존재하지 않는 userId(userRepository.findById(userId).size() == 0) 이면 404

        // 레포에서 이 사용자의 모든 계좌 가져오기
        // dto 조립해서 컨트롤러에 반환
        List<Account> accountList = accountRepository.findByUserId(userId);

        // 사용할 dto 변수 미리 선언
        GetLinkedAccountListResponseDto getLinkedAccountListResponse;

        // 조회된 게 없으면 바로 응답
        if(accountList.isEmpty()){
            getLinkedAccountListResponse = GetLinkedAccountListResponseDto.builder()
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
        getLinkedAccountListResponse = GetLinkedAccountListResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 연동계좌 조회 성공")
                .data(GetLinkedAccountListResponseDto.Data.builder().accounts(accountDtoList).build())
                .build();

        // 응답
        return getLinkedAccountListResponse;
    }

    // 4-1-3
    public GetAccountResponseDto getAccount(long userId, Long accountId) {

        // 존재하지 않는 accountId이면 404 응답
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));

        // 사용자의 userId != 조회한 계좌의 userId 이면 403

        // dto 조립하기
        // dto > data
        AccountDto accountDto = AccountDto.builder()
                .accountNo(account.getEncryptedAccountNo())
                .bankName(account.getBank().getName())
                .bankCode(account.getBank().getCode())
                .build();

        GetAccountResponseDto getAccountResponseDto = GetAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 계좌 상세조회 성공")
                .data(accountDto)
                .build();

        // 응답
        return getAccountResponseDto;
    }

    // 4-1-4
    public GetPrimaryAccountResponseDto getPrimaryAccount(long userId) {

        // account table에서 이 userId 이면서 is_primary==true인 계좌조회
        Account account = accountRepository.findByUserIdAndIsPrimaryTrue(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));

        // account dto 말고, 그걸로 dto 말아서 응답
        // dto > data
        AccountDto accountDto = AccountDto.builder()
                .accountNo(account.getEncryptedAccountNo())
                .bankName(account.getBank().getName())
                .bankCode(account.getBank().getCode())
                .build();

        // dto
        GetPrimaryAccountResponseDto getPrimaryAccountResponseDto = GetPrimaryAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 대표계좌 조회 성공")
                .data(accountDto)
                .build();

        // 응답
        return getPrimaryAccountResponseDto;
    }

    // 4-1-5
    public DeleteLinkedAccountResponseDto deleteLinkedAccount(long userId, Long accountId) {

        // 조회 결과가 없으면 404
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));
        
        // 조회한 계좌가 이 userId꺼가 아니면 403
        
        // account 레포에서 삭제
        accountRepository.deleteById(accountId);

        // dto 조립
        // dto > data
        AccountDto accountDto = AccountDto.builder()
                .accountNo(account.getEncryptedAccountNo())
                .bankCode(account.getBank().getCode())
                .bankName(account.getBank().getName())
                .build();

        // dto
        DeleteLinkedAccountResponseDto deleteLinkedAccountResponseDto = DeleteLinkedAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 대표계좌 조회 성공")
                .data(accountDto)
                .build();

        // 응답
        return deleteLinkedAccountResponseDto;
    }

    // 4-2-1
    public RequestVerificationResponseDto requestVerification(long userId, String accountNo) {

        // 1원 송금받는 사용자 통장내역에 찍힐 기업명 만들기
        // account에서 account 조회 -> bank 획득해서 bankName 얻기
        Account account = accountRepository.findByAccountNo(accountNo).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));
        String authText = account.getBank().getName();

        // 싸피 금융 API에 요청보낼 바디 만들기
        // 현재 로그인된 사용자의 userId 획득 -> DB에서 이 userId를 가지는 사용자의 이메일 조회 -> 싸피 금융 api에 userKey 요청 -> 획득 후 헤더에 userKey 포함해서 요청보내야함
        // 지금은 더미데이터 v1의 userKey로 사용

        // 요청보낼 url
        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/openAccountAuth";
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter(LocalDateTime.now());
        Header header = Header.builder()
                .apiName("openAccountAuth")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionDate(formattedDateTime.get("time"))
                .apiServiceCode("openAccountAuth")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(ssafyFinanceUserKey)
                .build();

        Map<String, Object> body = new HashMap<>();
        body.put("Header", header);
        body.put("accountNo", accountNo);
        body.put("authText", authText);

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body);

        // 요청 보내기
        ResponseEntity<SSAFYRequestVerificationResponseDto> httpResponse = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity,
                SSAFYRequestVerificationResponseDto.class
        );

        // SSAFY 금융망 API로부터 받은 응답 가지고 dto 조립
        RequestVerificationResponseDto requestVerificationResponseDto = RequestVerificationResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 1원인증 요청 성공")
                .build();

    }
}
