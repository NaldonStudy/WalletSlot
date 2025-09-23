package com.ssafy.b108.walletslot.backend.domain.transaction.service;

import com.ssafy.b108.walletslot.backend.common.dto.Header;
import com.ssafy.b108.walletslot.backend.common.util.AESUtil;
import com.ssafy.b108.walletslot.backend.common.util.LocalDateTimeFormatter;
import com.ssafy.b108.walletslot.backend.common.util.RandomNumberGenerator;
import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
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
    private final RestTemplate restTemplate;

    @Value("${api.ssafy.finance.apiKey}")
    private String ssafyFinanceApiKey;

    private String lastSyncedDate;

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

    // 주기적으로 거래내역 api를 호출. (기간은 마지막으로 연동했던 시간부터~)
    // 호출한 결과값의 맨 마지막 transactionUniqueNo이 마지막으로 내가 알고있던 transactionUniqueNo보다 크다면 결과값 리스트 첨부터 돌면서
    // 마지막 transactionUniqueNo보다 크다면 transactionUniqueNo 갱신하고 해당 거래내역 정보 가지고 가맹점_슬롯 중간 테이블에 검색
    // 있다면 그 쪽으로 차감. (transaction 객체 생성하고 save할때 그 슬롯의 정보를 포함하고 슬롯 예산 잔액 등 비즈니스 로직 수행해야겠지)
    // 없다면 미분류 슬롯으로 해서 일단 transaction 객체 생성해서 save.
    // 그리고 fcm 토큰 가져와서 firebase에 알림 요청. (notification 테이블에도 notification 객체 만들어서 save.하고 비즈니스 로직 수행)
    public void checkTransactions(@AuthenticationPrincipal UserPrincipal principal) {

        // 우리 서비스 전체 유저
        List<User> users = userRepository.findAll();

        for(User user : users) {
            // 유저키 조회
            String userKey = user.getUserKey();

            // 현재 유저의 계좌 리스트 조회
            List<Account> accounts = accountRepository.findByUser(user);

            for(Account account : accounts) {
                // period 기간동안의 거래내역 조회하기
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

                for(SSAFYGetTransactionListResponseDto.Transaction transactionDto : transactions) {

                    // transactionUniqueNo이 lastSyncedTransactionNo보다 큰 게 있다면 갱신
                    if(Long.parseLong(transactionDto.getTransactionUniqueNo()) > Long.parseLong(account.getLastSyncedTransactionUniqueNo())) {
                        account.updateLastSyncedTransactionUniqueNo(transactionDto.getTransactionUniqueNo());

                        // transaction summary 보고 우리 DB에 슬롯 매핑돼있는거 있는지 검색
                        // 있다면 그걸로 accountSlot해서 Transaction 객체 만들어서 save. + 해당 accountSlot의 예산 초과하지 않았는지 다시 조사 + 초과했다면 accountSlot의 isAlertSent = true + notification 객체 만들어서 save. + 푸시알림(성공하면 notification의 isDelivered = true)
                        // 없다면 미분류 슬롯으로 accountSlot해서 Transaction 객체 만들어서 save. + notification 객체 만들어서 save. + 푸시알림(성공하면 notification의 isDelivered = true)
                        // 계좌 각종 필드들 최신화
                        //
                    }
                }
            }


        }
    }



}
