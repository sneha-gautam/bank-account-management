package com.api.bank.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.bank.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountNumber(String accountNumber);
}
