package com.ssafy.b108.walletslot.backend.domain.transaction.service;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.GetAccountSlotTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.GetAccountTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.SplitTransactionResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.entity.Transaction;
import com.ssafy.b108.walletslot.backend.domain.transaction.repository.TransactionRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    // Field
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AccountSlotRepository accountSlotRepository;

    // Method
    /**
     * 6-1-1 계좌 거래내역 전체조회
     */
    public GetAccountTransactionListResponseDto getAccountTransactionList(Long userId, String accountUuid) {

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
                .message("[TransactionService - 000] 계좌 거래내역 전체조회 성공")
                .data(GetAccountTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountTransactionListResponseDto;
    }

    /**
     * 6-1-2 슬롯 거래내역 전체조회
     */
    public GetAccountSlotTransactionListResponseDto getAccountSlotTransactionList(Long userId, String accountUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // account != account slot의 account 이면 400 응답
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(!account.getUuid().equals(accountSlot.getAccount().getUuid())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "TransactionService - 003");
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
                .message("[TransactionService - 000] 슬롯 거래내역 전체조회 성공")
                .data(GetAccountSlotTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountSlotTransactionListResponseDto;
    }

    /**
     * 6-2-1 거래내역 나누기
     */
    public SplitTransactionResponseDto splitTransaction(Long userId, String accountUuid, String transactionUuid) {

        return null;
    }
}
