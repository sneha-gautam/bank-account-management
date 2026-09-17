package com.api.bank.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.bank.model.Transaction;
import com.api.bank.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    // Save a transaction
    public Transaction saveTransaction(
            String accountNumber,
            String type,
            BigDecimal amount,
            BigDecimal balanceAfter) {

        Transaction transaction = new Transaction();

        transaction.setAccountNumber(accountNumber);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setTransactionDate(LocalDateTime.now());

        return repository.save(transaction);
    }

    // Get transaction history
    public List<Transaction> getTransactionsByAccount(String accountNumber) {
        return repository.findByAccountNumber(accountNumber);
    }
}