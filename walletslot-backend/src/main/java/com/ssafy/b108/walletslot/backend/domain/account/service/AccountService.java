package com.ssafy.b108.walletslot.backend.domain.account.service;

import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.AESUtil;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.domain.account.dto.*;
import com.ssafy.b108.walletslot.backend.domain.account.dto.external.*;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.bank.entity.Bank;
import com.ssafy.b108.walletslot.backend.domain.bank.repository.BankRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.Email;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.EmailRepository;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
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

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    // Field
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;

    @Value("${api.ssafy.finance.apiKey}")
    private String ssafyFinanceApiKey;

    private final SecretKey encryptionKey;
    private final RestTemplate restTemplate;

    // Method
    // 4-1-1
    public GetAccountListResponseDto getAccountList(Long userId) {

        // user 조회 -> userKey 획득하기
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService]"));
        String userKey = user.getUserKey();

        // SSAFY 금융 API >>>>> 2.4.4 계좌 목록 조회
        // 요청보낼 url
        String url2 = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountList";
        
        // Header 만들기
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
        Header header = Header.builder()
                .apiName("inquireDemandDepositAccountList")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionTime(formattedDateTime.get("time"))
                .apiServiceCode("inquireDemandDepositAccountList")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(userKey)
                .build();

        Map<String, Object> body2 = new HashMap<>();
        body2.put("Header", header);

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity2 = new HttpEntity<>(body2);

        // 요청 보내기
        ResponseEntity<SSAFYGetAccountListResponseDto> httpResponse2 = restTemplate.exchange(
                url2,
                HttpMethod.POST,
                httpEntity2,
                SSAFYGetAccountListResponseDto.class
        );

        // SSAFY 금융망 API로부터 받은 응답 가지고 dto 조립
        // dto > data > accounts
        List<AccountDto> accountDtoList = httpResponse2.getBody().getREC().stream().map(account -> AccountDto.builder()
                        .accountNo(account.getAccountNo())
                        .bankName(account.getBankName())
                        .bankCode(account.getBankCode())
                        .accountBalance(account.getAccountBalance())
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
        List<Account> accountList = accountRepository.findByUser(userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]")));

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
        List<AccountDto> accountDtoList = accountList.stream()
                .map(account -> {
                    try{
                        return AccountDto.builder()
                                .accountId(account.getUuid())
                                .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                                .bankName(account.getBank().getName())
                                .bankCode(account.getBank().getCode())
                                .alias(account.getAlias())
                                .accountBalance(String.valueOf(account.getBalance()))
                                .build();
                    } catch(Exception e) {
                        throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "AccountService - 000");
                    }
                })
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
    public GetAccountResponseDto getAccount(long userId, String accountId) {

        // 존재하지 않는 accountId이면 404 응답
        Account account = accountRepository.findByUuid(accountId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));

        // 사용자의 userId != 조회한 계좌의 userId 이면 403

        // dto 조립하기
        // dto > data
        AccountDto accountDto;
        try{
            accountDto = AccountDto.builder()
                    .accountId(account.getUuid())
                    .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                    .bankName(account.getBank().getName())
                    .bankCode(account.getBank().getCode())
                    .alias(account.getAlias())
                    .accountBalance(String.valueOf(account.getBalance()))
                    .build();
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
        }

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
        Account account = accountRepository.findByUserAndIsPrimaryTrue(
                userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]")))
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));

        // account dto 말고, 그걸로 dto 말아서 응답
        // dto > data
        AccountDto accountDto;
        try {
            accountDto = AccountDto.builder()
                    .accountId(account.getUuid())
                    .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                    .bankName(account.getBank().getName())
                    .bankCode(account.getBank().getCode())
                    .alias(account.getAlias())
                    .accountBalance(String.valueOf(account.getBalance()))
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
        }

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
    public DeleteLinkedAccountResponseDto deleteLinkedAccount(long userId, String accountId) {

        // 조회 결과가 없으면 404
        Account account = accountRepository.findByUuid(accountId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));
        
        // 조회한 계좌가 이 userId꺼가 아니면 403
        
        // account 레포에서 삭제
        accountRepository.deleteByUuid(accountId);

        // dto 조립
        // dto > data
        AccountDto accountDto;
        try {
            accountDto = AccountDto.builder()
                    .accountId(account.getUuid())
                    .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                    .bankCode(account.getBank().getCode())
                    .bankName(account.getBank().getName())
                    .alias(account.getAlias())
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
        }

        // dto
        DeleteLinkedAccountResponseDto deleteLinkedAccountResponseDto = DeleteLinkedAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 계좌 삭제 성공")
                .data(accountDto)
                .build();

        // 응답
        return deleteLinkedAccountResponseDto;
    }

    // 4-2-1
    public RequestVerificationResponseDto requestVerification(long userId, String bankUuid, String accountNo) {

        // user 조회 -> userKey 획득하기
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService]"));
        String userKey = user.getUserKey();

        // SSAFY 금융 API >>>>> 2.4.6 예금주 조회
        // 방금 조회한 사용자의 이름 != 예금주 명이면 403 보내야 함

        // 1원 송금받는 사용자 통장내역에 찍힐 기업명 만들기
        Bank bank = bankRepository.findByUuid(bankUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));
        String bankName = bank.getName();

        // SSAFY 금융 API >>>>> 2.9.1 1원 송금
        // 요청보낼 url
        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/openAccountAuth";
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
        Header header = Header.builder()
                .apiName("openAccountAuth")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionTime(formattedDateTime.get("time"))
                .apiServiceCode("openAccountAuth")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(userKey)
                .build();

        Map<String, Object> body2 = new HashMap<>();
        body2.put("Header", header);
        body2.put("accountNo", accountNo);
        body2.put("authText", bankName);

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity2 = new HttpEntity<>(body2);

        // 요청 보내기
        restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity2,
                Void.class
        );

        // dto 조립
        RequestVerificationResponseDto requestVerificationResponseDto = RequestVerificationResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 1원인증 요청 성공")
                .build();

        return requestVerificationResponseDto;
    }

    // 4-2-2
    public VerifyAccountResponseDto verifyAccount(long userId, String accountNo, String authText, String authCode) {

        // user 조회 -> userKey 획득하기
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService]"));
        String userKey = user.getUserKey();

        // SSAFY 금융 API >>>>> 2.9.2 1원 송금 검증
        // 요청보낼 url
        String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/checkAuthCode";
        Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
        Header header = Header.builder()
                .apiName("checkAuthCode")
                .transmissionDate(formattedDateTime.get("date"))
                .transmissionTime(formattedDateTime.get("time"))
                .apiServiceCode("checkAuthCode")
                .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                .apiKey(ssafyFinanceApiKey)
                .userKey(userKey)
                .build();

        Map<String, Object> body2 = new HashMap<>();
        body2.put("Header", header);
        body2.put("accountNo", accountNo);
        body2.put("authText", authText);
        body2.put("authCode", authCode);

        // 요청보낼 http entity 만들기
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body2);

        // 요청 보내기
        ResponseEntity<SSAFYverifyAccountResponseDto> httpResponse2 = restTemplate.exchange(
                url,
                HttpMethod.POST,
                httpEntity,
                SSAFYverifyAccountResponseDto.class
        );

        // dto 만들기 (SUCCESS 키 값에 따라 분기처리)
        if(httpResponse2.getBody().getREC().getStatus().equals("SUCCESS")) {
            VerifyAccountResponseDto verifyAccountResponseDto = VerifyAccountResponseDto.builder()
                    .success(true)
                    .message("[AccountService - 000] 1원인증 검증 결과: 인증번호 일치")
                    .data(VerifyAccountResponseDto.Data.builder()
                            .accountNo(httpResponse2.getBody().getREC().getAccountNo())
                            .build())
                    .build();

            return verifyAccountResponseDto;
        } else if(httpResponse2.getBody().getREC().getStatus().equals("FAIL")) {
            VerifyAccountResponseDto verifyAccountResponseDto = VerifyAccountResponseDto.builder()
                    .success(true)
                    .message("[AccountService - 000] 1원인증 검증 결과: 인증번호 불일치")
                    .data(VerifyAccountResponseDto.Data.builder()
                            .accountNo(httpResponse2.getBody().getREC().getAccountNo())
                            .build())
                    .build();

            return verifyAccountResponseDto;
        } else {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
        }
    }

    // 4-3-1
    public AddAccountResponseDto addAccount(long userId, List<AddAccountRequestDto.AccountDto> accounts) {

        // accounts 배열 돌면서 그때그때 Account 객체 만들고, save.
        // 그 와중에 userId의 이름 != 등록할 계좌의 예금주 이름인 account 있으면 403

        List<com.ssafy.b108.walletslot.backend.domain.account.dto.AccountDto> accountDtoList = new ArrayList<>();
        for(AddAccountRequestDto.AccountDto accountDto : accounts) {

            // user 조회 -> userKey 획득하기
            User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService]"));
            String userKey = user.getUserKey();

            // 싸피 금융 API에 요청보낼 바디 만들기
            // 현재 로그인된 사용자의 userId 획득 -> DB에서 이 userId를 가지는 사용자의 이메일 조회 -> 싸피 금융 api에 userKey 요청 -> 획득 후 헤더에 userKey 포함해서 요청보내야함
            // 지금은 더미데이터 v1의 userKey로 사용

            // 요청보낼 url (예금주 조회)
            String url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountHolderName";
            Map<String, String> formattedDateTime = LocalDateTimeFormatter.formatter();
            Header header = Header.builder()
                    .apiName("inquireDemandDepositAccountHolderName")
                    .transmissionDate(formattedDateTime.get("date"))
                    .transmissionTime(formattedDateTime.get("time"))
                    .apiServiceCode("inquireDemandDepositAccountHolderName")
                    .institutionTransactionUniqueNo(formattedDateTime.get("date") + formattedDateTime.get("time") + RandomNumberGenerator.generateRandomNumber())
                    .apiKey(ssafyFinanceApiKey)
                    .userKey(userKey)
                    .build();

            Map<String, Object> body2 = new HashMap<>();
            body2.put("Header", header);
            body2.put("accountNo", accountDto.getAccountNo());

            // 요청보낼 http entity 만들기
            HttpEntity<Map<String, Object>> httpEntity2 = new HttpEntity<>(body2);

            // 요청 보내기
            ResponseEntity<SSAFYGetAccountHolderNameResponseDto> httpResponse2 = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity2,
                    SSAFYGetAccountHolderNameResponseDto.class
            );

            // 현재 요청보낸 사용자 이름 != 방금 조회한 예금주명 이면 403 응답
            if(!user.getName().equals(httpResponse2.getBody().getREC().getUserName())) {
                new AppException(ErrorCode.FORBIDDEN, "[AccountService]");
            }

            // Bank 객체 조회하기 (없으면 404)
            Bank bank = bankRepository.findByUuid(accountDto.getBankId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 002]"));

            // 계좌번호 암호화
            String encryptedAccountNo;
            try {
                encryptedAccountNo = AESUtil.encrypt(accountDto.getAccountNo(), encryptionKey);
            } catch(Exception e) {
                throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
            }

            // Account 객체 만들기
            Account account = Account.builder()
                    .user(user)
                    .bank(bank)
                    .encryptedAccountNo(encryptedAccountNo)
                    .build();

            // Account 객체 저장
            accountRepository.save(account);

            // dto 조립하기
            // dto > data > accounts
            com.ssafy.b108.walletslot.backend.domain.account.dto.AccountDto accountDto2;
            try {
                accountDto2 = AccountDto.builder()
                        .accountId(account.getUuid())
                        .bankCode(account.getBank().getCode())
                        .bankName(account.getBank().getName())
                        .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                        .build();
            } catch(Exception e) {
                throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
            }
            accountDtoList.add(accountDto2);
        } // 연동요청 받은 모든 계좌들에 대해 Account 객체로 만들어서 account 테이블에 저장 완료.

        // dto 조립하기
        AddAccountResponseDto addAccountResponseDto = AddAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 계좌연동 성공")
                .data(AddAccountResponseDto.Data.builder().accounts(accountDtoList).build())
                .build();

        return addAccountResponseDto;
    }

    // 4-3-2
    public ModifyAccountResponseDto modifyAccount(Long userId, String accountId, ModifyAccountRequestDto request) {

        // account 객체 조회 (없으면 404)
        Account account = accountRepository.findByUuid(accountId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[AccountService - 000]"));

        // userId != account의 userId이면 403 응답
        if(userId != account.getUser().getId()) {
            new AppException(ErrorCode.FORBIDDEN, "[AccountService - 000]");
        }

        // request 돌면서 null 아닌거 있으면 update 메서드 호출
        if(request.getAlias() != null) {
            account.updateAlias(request.getAlias());
        }

        if(request.getIsPrimary() != null) {
            account.updateIsPrimary(request.getIsPrimary());
        }

        // dto 조립
        // dto > data
        AccountDto accountDto;
        try {
            accountDto = AccountDto.builder()
                    .accountId(account.getUuid())
                    .bankCode(account.getBank().getCode())
                    .bankName(account.getBank().getName())
                    .accountNo(AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey))
                    .build();
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[AccountService - 000]");
        }

        // dto
        ModifyAccountResponseDto modifyAccountResponseDto = ModifyAccountResponseDto.builder()
                .success(true)
                .message("[AccountService - 000] 계좌정보 수정 성공")
                .data(accountDto)
                .build();

        // 응답
        return modifyAccountResponseDto;
    }
}
