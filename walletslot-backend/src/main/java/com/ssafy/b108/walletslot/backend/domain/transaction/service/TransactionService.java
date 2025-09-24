package com.ssafy.b108.walletslot.backend.domain.transaction.service;

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
import com.ssafy.b108.walletslot.backend.domain.notification.repository.NotificationRepository;
import com.ssafy.b108.walletslot.backend.domain.notification.repository.PushEndpointRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.ChatGPTRequestDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.ChatGPTResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.ChatGPTRequestDto.AccountSlotDto;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.MerchantSlotDecision;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.MerchantSlotDecisionRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.SSAFYGetAccountBalanceResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.external.SSAFYGetTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.*;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    // Field
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AccountSlotRepository accountSlotRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final MerchantSlotDecisionRepository merchantSlotDecisionRepository;
    private final NotificationRepository notificationRepository;
    private final PushEndpointRepository pushEndpointRepository;
    private final FcmService fcmService;
    private final RestTemplate restTemplate;

    @Qualifier("ssafyGmsWebClient") private final WebClient ssafyGmsWebClient;
    @Qualifier("fcmWebClient") private final WebClient fcmWebClient;

    @Value("${api.ssafy.finance.apiKey}")
    private String ssafyFinanceApiKey;

    private String lastSyncedDate="20250923";

    private final SecretKey encryptionKey;

    // Method
    /**
     * 6-1-1 계좌 거래내역 전체조회
     */
    public GetAccountTransactionListResponseDto getAccountTransactions(Long userId, String accountUuid) {

        // userId != account userId 이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // dto > data > transactions
        List<Transaction> transactionList = transactionRepository.findByAccount(account);
        List<GetAccountTransactionListResponseDto.TransactionDto> transactionDtoList = new ArrayList<>();
        for(Transaction transaction : transactionList) {

            GetAccountTransactionListResponseDto.TransactionDto transactionDto = GetAccountTransactionListResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .type(transaction.getType())
                    .opponentAccountNo(transaction.getOpponentAccountNo())
                    .summary(transaction.getSummary())
                    .amount(transaction.getAmount())
                    .balance(transaction.getBalance())
                    .transactionAt(transaction.getTransactionAt())
                    .build();

            transactionDtoList.add(transactionDto);
        }

        // dto
        GetAccountTransactionListResponseDto getAccountTransactionListResponseDto = GetAccountTransactionListResponseDto.builder()
                .success(true)
                .message("[TransactionService - 003] 계좌 거래내역 전체조회 성공")
                .data(GetAccountTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountTransactionListResponseDto;
    }

    /**
     * 6-1-2 슬롯 거래내역 전체조회
     */
    public GetAccountSlotTransactionListResponseDto getAccountSlotTransactions(Long userId, String accountUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 004"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 005");
        }

        // account != account slot의 account 이면 400 응답
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 006"));
        if(!account.getUuid().equals(accountSlot.getAccount().getUuid())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "TransactionService - 007");
        }

        // 슬롯 거래내역 전체조회
        // dto > data > transactions
        List<Transaction> transactionList =  transactionRepository.findByAccountSlot(accountSlot);
        List<GetAccountSlotTransactionListResponseDto.TransactionDto> transactionDtoList = new ArrayList<>();
        for(Transaction transaction : transactionList) {

            GetAccountSlotTransactionListResponseDto.TransactionDto transactionDto = GetAccountSlotTransactionListResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .type(transaction.getType())
                    .opponentAccountNo(transaction.getOpponentAccountNo())
                    .summary(transaction.getSummary())
                    .amount(transaction.getAmount())
                    .balance(transaction.getBalance())
                    .transactionAt(transaction.getTransactionAt())
                    .build();

            transactionDtoList.add(transactionDto);
        }

        // dto
        GetAccountSlotTransactionListResponseDto getAccountSlotTransactionListResponseDto = GetAccountSlotTransactionListResponseDto.builder()
                .success(true)
                .message("[TransactionService - 008] 슬롯 거래내역 전체조회 성공")
                .data(GetAccountSlotTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountSlotTransactionListResponseDto;
    }

    /**
     * 6-1-3 거래내역을 다른 슬롯으로 이동
     */
    public ModifyTransactionResponseDto modifyTransaction(Long userId, String accountUuid, String transactionUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 009"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 010");
        }

        // accountSlot이 이 account의 슬롯이 아니면 400 응답
        AccountSlot newAccountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 011"));
        if(!account.getUuid().equals(newAccountSlot.getAccount().getUuid())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "TransactionService - 012");
        }

        // transaction 조회
        Transaction transaction = transactionRepository.findByUuid(transactionUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 013"));

        // transaction의 account slot을 새로운 account slot 객체로 바꿔주기
        AccountSlot oldAccountSlot = transaction.getAccountSlot();
        transaction.changeAccountSlot(newAccountSlot);

        // 기존 account slot의 지출금액 minus
        oldAccountSlot.minusSpent(transaction.getAmount());

        // isBudgetExceeded 여부 다시 조사
        if(oldAccountSlot.getSpent() > oldAccountSlot.getCurrentBudget()) {
            oldAccountSlot.updateIsBudgetExceeded(true);
        } else {
            oldAccountSlot.updateIsBudgetExceeded(false);
        }
        
        // 새로운 account slot 지출금액 add
        newAccountSlot.addSpent(transaction.getAmount());

        // isBudgetExceeded 여부 다시 조사
        if(newAccountSlot.getSpent() > newAccountSlot.getCurrentBudget()) {
            newAccountSlot.updateIsBudgetExceeded(true);
        } else {
            newAccountSlot.updateIsBudgetExceeded(false);
        }

        // oldAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long oldAccountSlotExceededBudget = oldAccountSlot.getSpent() - oldAccountSlot.getCurrentBudget();
        if(oldAccountSlotExceededBudget < 0) {
            oldAccountSlotExceededBudget = 0L;
        }

        // oldAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long oldAccountSlotRemainingBudget = oldAccountSlot.getCurrentBudget() - oldAccountSlot.getSpent();
        if(oldAccountSlotRemainingBudget < 0) {
            oldAccountSlotRemainingBudget = 0L;
        }

        // dto > data > originalTransaction > slot
        ModifyTransactionResponseDto.SlotDto originalAccountSlotDto = ModifyTransactionResponseDto.SlotDto.builder()
                .accountSlotId(oldAccountSlot.getUuid())
                .name(oldAccountSlot.getSlot().getName())
                .isSaving(oldAccountSlot.getSlot().isSaving())
                .icon(oldAccountSlot.getSlot().getIcon())
                .color(oldAccountSlot.getSlot().getColor())
                .isCustom(oldAccountSlot.isCustom())
                .customName(oldAccountSlot.getCustomName())
                .currentBudget(oldAccountSlot.getCurrentBudget())
                .spent(oldAccountSlot.getSpent())
                .remainingBudget(oldAccountSlotRemainingBudget)
                .isBudgetExceeded(oldAccountSlot.isBudgetExceeded())
                .exceededBudget(oldAccountSlotExceededBudget)
                .build();

        // newAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long newAccountSlotExceededBudget = newAccountSlot.getSpent() - newAccountSlot.getCurrentBudget();
        if(newAccountSlotExceededBudget < 0) {
            newAccountSlotExceededBudget = 0L;
        }

        // newAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long newAccountSlotRemainingBudget = newAccountSlot.getCurrentBudget() - newAccountSlot.getSpent();
        if(newAccountSlotRemainingBudget < 0) {
            newAccountSlotRemainingBudget = 0L;
        }

        // dto > data > reassignedTransaction > slot
        ModifyTransactionResponseDto.SlotDto reassignedAccountSlotDto = ModifyTransactionResponseDto.SlotDto.builder()
                .accountSlotId(newAccountSlot.getUuid())
                .name(newAccountSlot.getSlot().getName())
                .isSaving(newAccountSlot.getSlot().isSaving())
                .icon(newAccountSlot.getSlot().getIcon())
                .color(newAccountSlot.getSlot().getColor())
                .isCustom(newAccountSlot.isCustom())
                .customName(newAccountSlot.getCustomName())
                .currentBudget(newAccountSlot.getCurrentBudget())
                .spent(newAccountSlot.getSpent())
                .remainingBudget(newAccountSlotRemainingBudget)
                .isBudgetExceeded(newAccountSlot.isBudgetExceeded())
                .exceededBudget(newAccountSlotExceededBudget)
                .build();

        // dto > data > originalTransaction, reassignedTransaction > transaction
        ModifyTransactionResponseDto.TransactionDto transactionDto = ModifyTransactionResponseDto.TransactionDto.builder()
                .transactionId(transaction.getUuid())
                .type(transaction.getType())
                .opponentAccountNo(transaction.getOpponentAccountNo())
                .summary(transaction.getSummary())
                .amount(transaction.getAmount())
                .balance(transaction.getBalance())
                .transactionAt(transaction.getTransactionAt())
                .build();

        // dto > data
        ModifyTransactionResponseDto.Data data = ModifyTransactionResponseDto.Data.builder()
                .transaction(transactionDto)
                .originalSlot(originalAccountSlotDto)
                .reassignedSlot(reassignedAccountSlotDto)
                .build();

        // dto
        ModifyTransactionResponseDto modifyTransactionResponseDto = ModifyTransactionResponseDto.builder()
                .success(true)
                .message("[TransactionService - 014] 거래내역 슬롯 재배치 성공")
                .data(data)
                .build();

        // 응답
        return modifyTransactionResponseDto;
    }

    /**
     * 6-2-1 거래내역 나누기
     */
    public AddSplitTransactionsResponseDto addSplitTransactions(Long userId, String accountUuid, String transactionUuid, List<AddSplitTransactionsRequestDto.SplitTransactionDto> splitTransactions) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 015"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 016");
        }

        // transaction 조회
        Transaction originalTransaction = transactionRepository.findByUuid(transactionUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 017"));
        Long originalAmount = originalTransaction.getAmount();

        // originalTransaction 삭제
        transactionRepository.delete(originalTransaction);

        // originalTransaction이 속해있던 account slot의 지출금액 회복시키기
        // account slot 조회 후 지출금액 등 값 조정
        AccountSlot originalTransactionAccountSlot = originalTransaction.getAccountSlot();
        originalTransactionAccountSlot.updateSpent(originalTransactionAccountSlot.getSpent() - originalTransaction.getAmount());
        if(originalTransactionAccountSlot.getCurrentBudget() >= originalTransactionAccountSlot.getSpent()) {
            originalTransactionAccountSlot.updateIsBudgetExceeded(false);
        } else {
            originalTransactionAccountSlot.updateIsBudgetExceeded(true);
        }

        // splitTransactions 돌면서 각각 Transaction 객체 만들어서 save.
        // 나머지 필드들은 origin 트랜잭션에서 가져오면 됨
        Long splitAmountSum = 0L;    // 나눈 금액들의 여태까지의 누적합을 저장할 변수
        List<AddSplitTransactionsResponseDto.SplitTransactionDto> splitTransactionDtos = new ArrayList<>();
        for(int i=0; i<splitTransactions.size(); i++) {

            // 이번 차례 SplitTransactionDto의 금액을 누적합해놓기
            AddSplitTransactionsRequestDto.SplitTransactionDto splitTransactionDto = splitTransactions.get(i);
            splitAmountSum += splitTransactionDto.getAmount();

            // AccountSlot 조회
            AccountSlot accountSlot = accountSlotRepository.findByUuid(splitTransactionDto.getAccountSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 018"));
            Slot slot = accountSlot.getSlot();  // 나눌 슬롯 정보도 줘야하니깐 Slot 객체 얻어놓기

            // Transaction 객체 만들기
            Transaction transaction = Transaction.builder()
                    .account(originalTransaction.getAccount())
                    .accountSlot(accountSlot)
                    .uniqueNo(originalTransaction.getUniqueNo())
                    .type(originalTransaction.getType())
                    .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                    .summary(originalTransaction.getSummary())
                    .amount(splitTransactionDto.getAmount())
                    .balance(originalTransaction.getBalance()+(originalTransaction.getAmount()-splitAmountSum))
                    .transactionAt(originalTransaction.getTransactionAt())
                    .build();

            // 저장
            transactionRepository.save(transaction);

            // account slot 지출금액 늘리기
            accountSlot.addSpent(splitTransactionDto.getAmount());

            // account slot 예산초과 여부 다시 조사하기
            if(accountSlot.getSpent() > accountSlot.getCurrentBudget()) {
                accountSlot.updateIsBudgetExceeded(true);
            } else {
                accountSlot.updateIsBudgetExceeded(false);
            }

            // dto > data > splitTransactions > slot
            // 예산초과 상태 아닐 때를 대비하여, exceededBudget값만 미리 계산
            Long exceededBudget = accountSlot.getSpent() - accountSlot.getCurrentBudget();
            if(exceededBudget < 0) {
                exceededBudget = 0L;
            }

            // originalAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
            Long accountSlotRemainingBudget = accountSlot.getCurrentBudget() - accountSlot.getSpent();
            if(accountSlotRemainingBudget < 0) {
                accountSlotRemainingBudget = 0L;
            }

            AddSplitTransactionsResponseDto.SlotDto slotDto = AddSplitTransactionsResponseDto.SlotDto.builder()
                    .accountSlotId(splitTransactionDto.getAccountSlotId())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .icon(slot.getIcon())
                    .color(slot.getColor())
                    .isCustom(accountSlot.isCustom())
                    .customName(accountSlot.getCustomName())
                    .currentBudget(accountSlot.getCurrentBudget())
                    .spent(accountSlot.getSpent())
                    .remainingBudget(accountSlotRemainingBudget)
                    .isBudgetExceeded(accountSlot.isBudgetExceeded())
                    .exceededBudget(exceededBudget)
                    .build();

            // dto > data > splitTransactions > transaction
            AddSplitTransactionsResponseDto.TransactionDto transactionDto2 = AddSplitTransactionsResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .amount(splitTransactionDto.getAmount())
                    .build();

            // dto > data > splitTransactions
            AddSplitTransactionsResponseDto.SplitTransactionDto splitTransactionDto2 = AddSplitTransactionsResponseDto.SplitTransactionDto.builder()
                    .slot(slotDto)
                    .transaction(transactionDto2)
                    .build();

            splitTransactionDtos.add(splitTransactionDto2);
        }

        // 마지막에 나눈 금액들의 합 == 원래 금액인지 검사하고, 같지 않으면 400 응답
        if(!originalAmount.equals(splitAmountSum)) {
            throw new AppException(ErrorCode.INVALID_SPLIT_AMOUNT, "TransactionService - 019");
        }

        //dto > data > originalTransaction
        AddSplitTransactionsResponseDto.OriginalTransactionDto originalTransactionDto = AddSplitTransactionsResponseDto.OriginalTransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalTransaction.getAmount())
                .transactionAt(originalTransaction.getTransactionAt())
                .build();
        
        // dto
        AddSplitTransactionsResponseDto addSplitTransactionsResponseDto = AddSplitTransactionsResponseDto.builder()
                .success(true)
                .message("[TransactionService - 020] 금액 나누기 성공")
                .data(AddSplitTransactionsResponseDto.Data.builder().originalTransaction(originalTransactionDto).splitTransactions(splitTransactionDtos).build())
                .build();

        // 응답
        return addSplitTransactionsResponseDto;
    }

    /**
     * 6-2-2 더치페이
     */
    public AddDutchPayTransactionsResponseDto addDutchPayTransactions(Long userId, String accountUuid, String transactionUuid, Integer n) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 021"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 022");
        }

        // transaction 조회하고 변경 전 지출금액과 거래 후 잔액 값 저장해두기
        Transaction originalTransaction = transactionRepository.findByUuid(transactionUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 023"));
        Long originalAmount = originalTransaction.getAmount();
        Long originalBalance = originalTransaction.getBalance();

        // 1/n 계산
        Long perPersonAmount = originalAmount / n;

        // originalTransaction의 지출금액과 거래 후 잔액 값 조정
        originalTransaction.minusAmount(originalAmount - perPersonAmount);
        originalTransaction.addBalance(originalAmount - perPersonAmount);

        // originalTransaction이 속한 슬롯 조회
        AccountSlot originalAccountSlot = originalTransaction.getAccountSlot();
        
        // originalAccountSlot 값들 미리 저장해두기
        Long originalSpent = originalAccountSlot.getSpent();
        Long originalCurrentBudget = originalAccountSlot.getCurrentBudget();
        boolean originalIsBudgetExceeded = originalAccountSlot.isBudgetExceeded();
        
        // originalAccountSlot 지출금액 1/n만 남겨두고 나머지는 회복시키기
        originalAccountSlot.minusSpent(originalAmount- perPersonAmount);

        // 미분류 슬롯에 들어갈 트랜잭션 객체 하나 더 만들고 save.
        // 이 계좌의 미분류 슬롯 객체 조회
        Slot uncategorizedSlot = slotRepository.findByUuid("c8e604bb-95e9-11f0-9470-3a932b1ba57c").orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 024"));
        AccountSlot uncategorizedAccountSlot = accountSlotRepository.findByAccountAndSlot(account, uncategorizedSlot).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 025"));
        Transaction newTransaction = Transaction.builder()
                .account(account)
                .accountSlot(uncategorizedAccountSlot)
                .uniqueNo(originalTransaction.getUniqueNo())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalAmount - perPersonAmount)
                .balance(originalBalance)
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        transactionRepository.save(newTransaction);

        // 미분류 슬롯의 지출금액 증가
        uncategorizedAccountSlot.addSpent(originalAmount - perPersonAmount);

        // dto > data > originalTransaction
        // originalAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long originalAccountSlotExceededBudget = originalSpent - originalCurrentBudget;
        if(originalAccountSlotExceededBudget < 0) {
            originalAccountSlotExceededBudget = 0L;
        }

        // originalAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long originalAccountSlotRemainingBudget = originalCurrentBudget - originalSpent;
        if(originalAccountSlotRemainingBudget < 0) {
            originalAccountSlotRemainingBudget = 0L;
        }

        // dto > data > originalTransaction > slotDto
        AddDutchPayTransactionsResponseDto.SlotDto originalSlotDto = AddDutchPayTransactionsResponseDto.SlotDto.builder()
                .accountSlotId(originalAccountSlot.getUuid())
                .name(originalAccountSlot.getSlot().getName())
                .isSaving(originalAccountSlot.getSlot().isSaving())
                .icon(originalAccountSlot.getSlot().getIcon())
                .color(originalAccountSlot.getSlot().getColor())
                .isCustom(originalAccountSlot.isCustom())
                .customName(originalAccountSlot.getCustomName())
                .currentBudget(originalCurrentBudget)
                .spent(originalSpent)
                .remainingBudget(originalAccountSlotRemainingBudget)
                .isBudgetExceeded(originalIsBudgetExceeded)
                .exceededBudget(originalAccountSlotExceededBudget)
                .build();

        // dto > data > originalTransaction > transactionDto
        AddDutchPayTransactionsResponseDto.TransactionDto originalTransactionDto = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalAmount)
                .balance(originalBalance)
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        // dto > data > dutchPayTransactions > slotDto > 0
        AddDutchPayTransactionsResponseDto.SlotDto dutchPaySlotDto0 = AddDutchPayTransactionsResponseDto.SlotDto.builder()
                .accountSlotId(originalAccountSlot.getUuid())
                .name(originalAccountSlot.getSlot().getName())
                .isSaving(originalAccountSlot.getSlot().isSaving())
                .icon(originalAccountSlot.getSlot().getIcon())
                .color(originalAccountSlot.getSlot().getColor())
                .isCustom(originalAccountSlot.isCustom())
                .customName(originalAccountSlot.getCustomName())
                .currentBudget(originalAccountSlot.getCurrentBudget())
                .spent(originalAccountSlot.getSpent())
                .remainingBudget(originalAccountSlot.getCurrentBudget() - originalAccountSlot.getSpent())
                .isBudgetExceeded(originalAccountSlot.isBudgetExceeded())
                .exceededBudget(originalAccountSlotExceededBudget)
                .build();

        // uncategorizedAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long uncategorizedAccountSlotExceededBudget = uncategorizedAccountSlot.getSpent() - uncategorizedAccountSlot.getCurrentBudget();
        if(uncategorizedAccountSlotExceededBudget < 0) {
            uncategorizedAccountSlotExceededBudget = 0L;
        }

        // uncategorizedAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long uncategorizedAccountSlotRemainingBudget = uncategorizedAccountSlot.getCurrentBudget() - uncategorizedAccountSlot.getSpent();
        if(uncategorizedAccountSlotRemainingBudget < 0) {
            uncategorizedAccountSlotRemainingBudget = 0L;
        }

        // dto > data > dutchPayTransactions > slotDto > 1
        AddDutchPayTransactionsResponseDto.SlotDto dutchPaySlotDto1 = AddDutchPayTransactionsResponseDto.SlotDto.builder()
                .accountSlotId(uncategorizedAccountSlot.getUuid())
                .name(uncategorizedAccountSlot.getSlot().getName())
                .isSaving(uncategorizedAccountSlot.getSlot().isSaving())
                .icon(uncategorizedAccountSlot.getSlot().getIcon())
                .color(uncategorizedAccountSlot.getSlot().getColor())
                .isCustom(uncategorizedAccountSlot.isCustom())
                .customName(uncategorizedAccountSlot.getCustomName())
                .currentBudget(uncategorizedAccountSlot.getCurrentBudget())
                .spent(uncategorizedAccountSlot.getSpent())
                .remainingBudget(uncategorizedAccountSlotRemainingBudget)
                .isBudgetExceeded(uncategorizedAccountSlot.isBudgetExceeded())
                .exceededBudget(uncategorizedAccountSlotExceededBudget)
                .build();

        // dto > data > dutchPayTransactions > transactionDto > 0
        AddDutchPayTransactionsResponseDto.TransactionDto dutchPayTransactionDto0 = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalTransaction.getAmount())
                .balance(originalTransaction.getBalance())
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        // dto > data > dutchPayTransactions > transactionDto > 1
        AddDutchPayTransactionsResponseDto.TransactionDto dutchPayTransactionDto1 = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(newTransaction.getUuid())
                .type(newTransaction.getType())
                .opponentAccountNo(newTransaction.getOpponentAccountNo())
                .summary(newTransaction.getSummary())
                .amount(newTransaction.getAmount())
                .balance(newTransaction.getBalance())
                .transactionAt(newTransaction.getTransactionAt())
                .build();

        List<AddDutchPayTransactionsResponseDto.SlotAndTransactionDto> dutchPayTransactions = new ArrayList<>();
        dutchPayTransactions.add(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(dutchPaySlotDto0).transaction(dutchPayTransactionDto0).build());
        dutchPayTransactions.add(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(dutchPaySlotDto1).transaction(dutchPayTransactionDto1).build());

        // dto > data
        AddDutchPayTransactionsResponseDto.Data data = AddDutchPayTransactionsResponseDto.Data.builder()
                .originalTransaction(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(originalSlotDto).transaction(originalTransactionDto).build())
                .dutchPayTransactions(dutchPayTransactions)
                .build();

        // dto
        AddDutchPayTransactionsResponseDto addDutchPayTransactionsResponseDto = AddDutchPayTransactionsResponseDto.builder()
                .success(true)
                .message("[TransactionService - 026] 더치페이 성공")
                .data(data)
                .build();

        // 응답
        return addDutchPayTransactionsResponseDto;
    }

    @Scheduled(fixedRate = 60000)
    public void checkTransactions() {

        // 우리 서비스 전체 유저
        List<User> users = userRepository.findAll();

        for(User user : users) {
            // 유저키 조회
            String userKey = user.getUserKey();

            // 현재 유저의 FCM 토큰과 계좌리스트 조회
            String targetFcmToken = pushEndpointRepository.findByUser(user).orElseThrow(() -> new AppException(ErrorCode.MISSING_PUSH_ENDPOINT, "TransactionService - 000")).getToken();
            List<Account> accounts = accountRepository.findByUser(user);

            for(Account account : accounts) {

                // SSAFY 금융 API >>>>> 2.4.12 계좌 거래내역 조회
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
                    throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "TransactionService - 001");
                }

                body1.put("startDate", lastSyncedDate);
                body1.put("endDate", formattedDateTime.get("date"));
                body1.put("transactionType", "A");
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

                // 거래내역 리스트 받기
                List<SSAFYGetTransactionListResponseDto.Transaction> transactions = httpResponse1.getBody().getREC().getList();

                // 이 계좌의 미분류 슬롯 미리 찾아두기
                Slot uncategorizedSlot = slotRepository.findById(0L).orElseThrow(() -> new AppException(ErrorCode.MISSING_UNCATEGORIZED_SLOT, "TransactionService - 000"));
                AccountSlot uncategorizedAccountSlot = accountSlotRepository.findBySlot(uncategorizedSlot).orElseThrow(() -> new AppException(ErrorCode.MISSING_UNCATEGORIZED_SLOT, "TransactionService - 000"));

                for(SSAFYGetTransactionListResponseDto.Transaction transactionDto : transactions) {
                    System.out.println(transactionDto.getTransactionTypeName());
                    System.out.println(transactionDto.getTransactionUniqueNo());
                    System.out.println(transactionDto.getTransactionSummary());
                    System.out.println(transactionDto.getTransactionAfterBalance());
                    System.out.println(transactionDto.getTransactionDate());

                }

                Transaction: for(SSAFYGetTransactionListResponseDto.Transaction transactionDto : transactions) {

// account.getLastSyncedTransactionUniqueNo()

                    // transactionUniqueNo이 lastSyncedTransactionNo보다 큰 게 있다면 갱신
                    if(Long.parseLong(transactionDto.getTransactionUniqueNo()) > Long.parseLong("0")) {

                        // 계좌 마지막 동기화 날짜 업데이트
                        account.updateLastSyncedTransactionUniqueNo(transactionDto.getTransactionUniqueNo());

                        // 거래내역 타입 받기
                        String transactionType = transactionDto.getTransactionTypeName();

                        // 이 거래내역에서 쓸 Transaction, Notification, AccountSlot 객체와 푸시알림을 보낼 때 사용할 title, body
                        Transaction newTransaction = null;
                        Notification notification = null;
                        AccountSlot accountSlot = null;
                        String title = null;
                        String body = null;

                        if(transactionType.equals("입금") || transactionType.equals("입금(이체)")) {    // 입금이면 무조건 미분류 슬롯에서 증액
                            uncategorizedAccountSlot.addBudget(transactionDto.getTransactionBalance());

                            // 푸시알림 내용
                            title = "[입금알림] " + transactionDto.getTransactionSummary() + "님이 입금하신 " + transactionDto.getTransactionBalance() + "원을 미분류 금액으로 증액했어요!🚀";
                            body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                            // Notification 객체 생성
                            notification = Notification.builder()
                                    .user(user)
                                    .title(title)
                                    .body(body)
                                    .type(Notification.Type.UNCATEGORIZED)
                                    .build();

                            // Notification 객체 저장
                            notificationRepository.save(notification);

                            // accountSlot을 미분류 슬롯으로 세팅
                            accountSlot = uncategorizedAccountSlot;
                        } else if (transactionType.equals("출금(이체)")) {    // 출금(이체)이면 무조건 미분류 슬롯에서 차감
                            uncategorizedAccountSlot.addSpent(transactionDto.getTransactionBalance());

                            // 푸시알림 내용
                            title = "[미분류 지출발생] " + transactionDto.getTransactionSummary() + "님에게 입금한 " + transactionDto.getTransactionBalance() + "원을 슬롯에 분배해주세요!🚀";
                            body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                            // Notification 객체 생성
                            notification = Notification.builder()
                                    .user(user)
                                    .title(title)
                                    .body(body)
                                    .type(Notification.Type.UNCATEGORIZED)
                                    .build();

                            // Notification 객체 저장
                            notificationRepository.save(notification);

                        } else {    // 출금이면 아래 로직 적용
                            String merchantName = transactionDto.getTransactionSummary();    // 발생한 거래내역 거래처 이름

                            // transaction summary 보고 우리 DB에 슬롯 매핑돼있는거 있는지 검색
                            MerchantSlotDecision merchantSlotDecision = merchantSlotDecisionRepository.findByMerchantName(merchantName);

                            // 우리 DB에 있는 결제처라면...
                            if(merchantSlotDecision != null) {
                                // 그 슬롯이 이 계좌에 개설돼있는지 조회
                                accountSlot = accountSlotRepository.findByAccountAndSlot(account, merchantSlotDecision.getSlot()).orElse(null);

                                if(accountSlot != null) { // 그 슬롯이 이 계좌에 있다면 그 슬롯으로 그대로 두고, Notification 객체 만들어서 저장

                                    // accountSlot 필드 최신화
                                    accountSlot.addSpent(transactionDto.getTransactionBalance());
                                    if((accountSlot.getCurrentBudget() - accountSlot.getSpent()) < 0) {    // 지출이 예산을 초과했다면...

                                        accountSlot.updateIsBudgetExceeded(true);

                                        // 푸시알림 내용
                                        String slotName = null;
                                        if(accountSlot.isCustom()) {
                                            slotName = accountSlot.getCustomName();
                                        } else {
                                            slotName = accountSlot.getSlot().getName();
                                        }

                                        title = "[예산초과] " + slotName + "슬롯의 예산이 초과됐어요!";
                                        body = "(초과금액: " + (accountSlot.getSpent() - accountSlot.getCurrentBudget()) + ")";

                                        // Notification 객체 만들고 저장
                                        Notification budgetExceededNotification = Notification.builder()
                                                .user(user)
                                                .title(title)
                                                .body(body)
                                                .type(Notification.Type.BUDGET)
                                                .build();

                                        notificationRepository.save(budgetExceededNotification);

                                        // 푸시알림 전송... 아휴
                                        fcmService.sendMessage(targetFcmToken, budgetExceededNotification.getTitle(), budgetExceededNotification.getBody());

                                    } else {    // 지출이 예산을 초과하지 않았다면...
                                        accountSlot.updateIsBudgetExceeded(false);    // 혹시 모르니깐 예산초과 여부 false로 한번 더 덮어씌우기
                                    }

                                    // 슬롯 이름 받아두기
                                    String slotName = null;
                                    if(accountSlot.isCustom()) {
                                        slotName = accountSlot.getCustomName();
                                    } else {
                                        slotName = accountSlot.getSlot().getName();
                                    }

                                    // 푸시알림 내용
                                    title = "[지출알림] " + transactionDto.getTransactionSummary() + "에서 결제한 " + transactionDto.getTransactionBalance() + "원을 " + slotName + " 슬롯에서 차감했어요!🚀";

                                    Long remainingBudget = accountSlot.getCurrentBudget() - accountSlot.getSpent();
                                    if(remainingBudget < 0) {
                                        body = "(⚠️" + slotName + " 슬롯 초과금액: " + (-remainingBudget) + "원)";
                                    } else {
                                        body = "(" + slotName + " 슬롯 현재잔액: " + remainingBudget + "원)";
                                    }

                                    // Notification 객체 생성
                                    notification = Notification.builder()
                                            .user(user)
                                            .title(title)
                                            .body(body)
                                            .type(Notification.Type.SLOT)
                                            .build();

                                    // Notification 객체 저장
                                    notificationRepository.save(notification);

                                } else {    // 그 슬롯이 이 계좌에 개설돼있지 않다면...
                                    AccountSlot recommededAccountSlot = recommendSlotFromGPT(account, merchantName);    //    이 계좌에 있는 슬롯들 기준으로 추천받기
                                    if(recommededAccountSlot != null) {    // 추천된게 있으면...
                                        // 그래도 일단 미분류 슬롯에서 차감
                                        accountSlot = uncategorizedAccountSlot;
                                        uncategorizedAccountSlot.addSpent(transactionDto.getTransactionBalance());

                                        // 슬롯이름 미리 받아두기
                                        String slotName = null;
                                        if(recommededAccountSlot.isCustom()) {
                                            slotName = recommededAccountSlot.getCustomName();
                                        } else {
                                            slotName = recommededAccountSlot.getSlot().getName();
                                        }

                                        // 푸시알림 내용
                                        title = "[미분류 지출발생] " + transactionDto.getTransactionSummary() + "에서 결제한 " + transactionDto.getTransactionBalance() + "원을 " + slotName + " 슬롯에서 차감할까요?☺️";
                                        body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                                        // Notification 객체 생성
                                        notification = Notification.builder()
                                                .user(user)
                                                .title(title)
                                                .body(body)
                                                .type(Notification.Type.UNCATEGORIZED)
                                                .build();

                                        // Notification 객체 저장
                                        notificationRepository.save(notification);
                                    } else {    // 추천된게 없다면...
                                        // 미분류 슬롯에서 차감
                                        accountSlot = uncategorizedAccountSlot;
                                        uncategorizedAccountSlot.addSpent(transactionDto.getTransactionBalance());

                                        // 푸시알림 내용
                                        title = "[미분류 지출발생] " + transactionDto.getTransactionSummary() + "에서 결제한 " + transactionDto.getTransactionBalance() + "원을 슬롯에 분배해주세요!🚀";
                                        body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                                        // Notification 객체 생성
                                        notification = Notification.builder()
                                                .user(user)
                                                .title(title)
                                                .body(body)
                                                .type(Notification.Type.UNCATEGORIZED)
                                                .build();

                                        // Notification 객체 저장
                                        notificationRepository.save(notification);
                                    }
                                }
                            } else { // 우리 DB에 존재하지 않아도 GPT한테 추천받기
                                AccountSlot recommededAccountSlot = recommendSlotFromGPT(account, merchantName);
                                if(recommededAccountSlot != null) {    // 추천된게 있다면...
                                    // 그래도 일단 미분류 슬롯에서 차감
                                    accountSlot = uncategorizedAccountSlot;
                                    uncategorizedAccountSlot.addSpent(transactionDto.getTransactionBalance());

                                    // 슬롯이름 미리 받아두기
                                    String slotName = null;
                                    if(recommededAccountSlot.isCustom()) {
                                        slotName = recommededAccountSlot.getCustomName();
                                    } else {
                                        slotName = recommededAccountSlot.getSlot().getName();
                                    }

                                    // 푸시알림 내용
                                    title = "[미분류 지출발생] " + transactionDto.getTransactionSummary() + "에서 결제한 " + transactionDto.getTransactionBalance() + "원을 " + slotName + " 슬롯에서 차감할까요?☺️";
                                    body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                                    // Notification 객체 생성
                                    notification = Notification.builder()
                                            .user(user)
                                            .title(title)
                                            .body(body)
                                            .type(Notification.Type.UNCATEGORIZED)
                                            .build();

                                    // Notification 객체 저장
                                    notificationRepository.save(notification);
                                } else {    // 추천된게 없다면...
                                    // 미분류 슬롯에서 차감
                                    accountSlot = uncategorizedAccountSlot;
                                    uncategorizedAccountSlot.addSpent(transactionDto.getTransactionBalance());

                                    // 푸시알림 내용
                                    title = "[미분류 지출발생] " + transactionDto.getTransactionSummary() + "에서 결제한 " + transactionDto.getTransactionBalance() + "원을 슬롯에 분배해주세요!🚀";
                                    body = "(미분류 누적금액: " + uncategorizedAccountSlot.getSpent() + "원)";

                                    // Notification 객체 생성
                                    notification = Notification.builder()
                                            .user(user)
                                            .title(title)
                                            .body(body)
                                            .type(Notification.Type.UNCATEGORIZED)
                                            .build();

                                    // Notification 객체 저장
                                    notificationRepository.save(notification);
                                }
                            }

                            // accountSlot에 들어있는 거 활용해서 Transaction 객체 만들기
                            newTransaction = Transaction.builder()
                                    .account(account)
                                    .accountSlot(accountSlot)
                                    .uniqueNo(transactionDto.getTransactionUniqueNo())
                                    .type(transactionDto.getTransactionTypeName())
                                    .opponentAccountNo(transactionDto.getTransactionAccountNo())
                                    .summary(transactionDto.getTransactionSummary())
                                    .amount(transactionDto.getTransactionBalance())
                                    .balance(transactionDto.getTransactionAfterBalance())
                                    .transactionAt(LocalDateTimeFormatter.StringToLocalDateTime(transactionDto.getTransactionDate(), transactionDto.getTransactionTime()))
                                    .build();

                            // Transaction 객체 저장
                            transactionRepository.save(newTransaction);

                            // 계좌 각종 필드들 최신화 (마지막 동기일, 잔액)
                            // SSAFY 금융 API >>>>> 2.4.12 계좌 거래내역 조회
                            // 요청보낼 url
                            String url2 = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountBalance";

                            // Header 만들기
                            Map<String, String> formattedDateTime2 = LocalDateTimeFormatter.formatter();
                            Header header2 = Header.builder()
                                    .apiName("inquireDemandDepositAccountBalance")
                                    .transmissionDate(formattedDateTime2.get("date"))
                                    .transmissionTime(formattedDateTime2.get("time"))
                                    .apiServiceCode("inquireDemandDepositAccountBalance")
                                    .institutionTransactionUniqueNo(formattedDateTime2.get("date") + formattedDateTime2.get("time") + RandomNumberGenerator.generateRandomNumber())
                                    .apiKey(ssafyFinanceApiKey)
                                    .userKey(userKey)
                                    .build();

                            // body 만들기
                            Map<String, Object> body2 = new HashMap<>();
                            body2.put("Header", header2);
                            try {
                                body2.put("accountNo", AESUtil.decrypt(account.getEncryptedAccountNo(), encryptionKey));
                            } catch(Exception e) {
                                throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "TransactionService - 001");
                            }

                            // 요청보낼 http entity 만들기
                            HttpEntity<Map<String, Object>> httpEntity2 = new HttpEntity<>(body2);

                            // 요청 보내기
                            ResponseEntity<SSAFYGetAccountBalanceResponseDto> httpResponse2 = restTemplate.exchange(
                                    url2,
                                    HttpMethod.POST,
                                    httpEntity2,
                                    SSAFYGetAccountBalanceResponseDto.class
                            );

                            // account 필드들 최신화
                            account.updateLastSyncedAt(LocalDateTime.now());
                            account.updateBalance(httpResponse2.getBody().getREC().getAccountBalance());

                            // lastSyncedDate 변수 최신화
                            lastSyncedDate = formattedDateTime.get("date");

                            // 위에서 만든 notification 푸시알림 보내기
                            targetFcmToken = pushEndpointRepository.findByUser(user).orElseThrow(() -> new AppException(ErrorCode.MISSING_PUSH_ENDPOINT, "TransactionService - 000")).getToken();
                            fcmService.sendMessage(targetFcmToken, notification.getTitle(), notification.getBody());

                        }
                    }
                }
            }
        }
    }

    /**
     * ChatGPT API 연결해서 단건 결제처에 대하여 슬롯 추천받는 메서드
     */
    private AccountSlot recommendSlotFromGPT(Account account, String merchantName) {
        // gpt한테 요청보내기
        // SSAFY GMS >>>>> gpt-5-nano
        // body 만들기
        // body > messages
        List<ChatGPTRequestDto.Message> messages = new ArrayList<>();

        ChatGPTRequestDto.Message message1 = ChatGPTRequestDto.Message.builder()
                .role("developer")
                .content("""
                        너는 대한민국의 어느 가맹점 이름을 보고 이게 어느 업종일지 추측하는 엔진 역할을 해.
                        나는 우리 서비스에서 제공하는 슬롯 리스트를 JSON 형태로 제공할거야. 거래처가 어느 업종일지는 이 슬롯 리스트 중에서 가장 가까워 보이는 걸로 추측해주면 돼. 절대 이 슬롯 리스트에 없는 업종으로 추측하면 안돼. 꼭 이 슬롯 리스트 중에서 가장 적절해 보이는 걸로 골라야 해.
                        """)
                .build();
        messages.add(message1);

        // gpt한테 보내기 위해 이 계좌 slot 전체조회
        List<AccountSlot> accountSlots = accountSlotRepository.findByAccount(account);

        // 계좌 슬롯 담을 Dto 리스트
        List<AccountSlotDto> accountSlotDtos = new ArrayList<>();
        for(AccountSlot accountSlot : accountSlots){

            ChatGPTRequestDto.AccountSlotDto accountSlotDto = ChatGPTRequestDto.AccountSlotDto.builder()
                    .slotName(accountSlot.getSlot().getName())
                    .alias(accountSlot.getCustomName())
                    .build();

            accountSlotDtos.add(accountSlotDto);
        }

        // gpt한테 보내기 위해 accountSlotDtos를 json으로 직렬화
        ObjectMapper objectMapper = new ObjectMapper();
        String accountSlotsData = null;
        try {
            accountSlotsData = objectMapper.writeValueAsString(accountSlotDtos);
        } catch(Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "TransactionService - 025");
        }

        // user 프롬프트 만들기
        String userPrompt = String.format("""
        [요구사항]
        1. 내가 제공한 가맹점 이름은 대한민국에 있는 한 가맹점의 이름이야.
        2. 이 가맹점이 내가 제공한 슬롯 리스트 중 어디에 가장 적절한지 딱 1개만 추천해줘.
        3. 답변은 인사말이나 다른 말 절대 덧붙이지 말고 딱 내가 보여준 반환 데이터 예시처럼 JSON 형태로만 해.
        4. 참고로, 나는 핀테크 서비스를 운영 중이야. 우리는 사용자가 마이데이터로 계좌를 연동하면, 해당 계좌에서 결제가 발생하면 그걸 감지해서 해당 결제의 결제처에 가장 적절한 슬롯에서 그 지출금액을 차감시켜주는 기능을 구현하고 있어. 우리가 미리 준비해둔 가맹점 DB에 존재하는 가맹점이면 거기에서 매핑되는 슬롯에서 금액을 차감시켜 주는데, 없는 가맹점이라면 ChatGPT에게 추천받아서 그걸 사용자에게 추천할거야.
        
        [입력 데이터]
        "merchantName" : %s,
        
        [슬롯 리스트]
        "slots": "%s"
        
        [반환 데이터 예시]
        {
            "recommendedSlot": {
                "name": "식비"
            }
        }
        """,
                merchantName, accountSlotsData
        );

        ChatGPTRequestDto.Message message2 = ChatGPTRequestDto.Message.builder()
                .role("user")
                .content(userPrompt)
                .build();
        messages.add(message2);

        ChatGPTRequestDto body = ChatGPTRequestDto.builder()
                .model("gpt-5-nano")
                .messages(messages)
                .build();

        // 요청보내기
        ChatGPTResponseDto httpResponse = callGMS(body);

        // gpt로부터 받은 응답 역직렬화
        JsonNode node;
        ChatGPTResponseDto.RecommendedSlotDto recommendedSlot;
        try {
            node = objectMapper.readTree(httpResponse.getChoices().get(0).getMessage().getContent());
            JsonNode slotsNode = node.get("recommendedSlot");

            recommendedSlot = objectMapper.readValue(
                    slotsNode.toString(),
                    new TypeReference<ChatGPTResponseDto.RecommendedSlotDto>(){}
            );
        } catch(Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "[SlotService - 026]");
        }

        // 추천받은 슬롯 이름
        String recommendedSlotName = recommendedSlot.getName();

        // 슬롯 객체 조회
        Slot slot = slotRepository.findByName(recommendedSlotName);
        AccountSlot accountSlot = accountSlotRepository.findByAccountAndSlot(account, slot).orElse(null);

        return accountSlot;
    }

    // ChatGPT 호출할 때 쓸 메서드
    private ChatGPTResponseDto callGMS(ChatGPTRequestDto body) {
        return ssafyGmsWebClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(ChatGPTResponseDto.class)
                .block();
    }


}
