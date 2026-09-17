package com.api.bank.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.bank.model.BankAccount;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    // Search by customer name
    List<BankAccount> findByCustomerNameContainingIgnoreCase(String customerName);

    // Search by account type
    List<BankAccount> findByAccountTypeIgnoreCase(String accountType);

    // Search by account status
    List<BankAccount> findByStatusIgnoreCase(String status);

    // Find accounts with balance greater than the given amount
    List<BankAccount> findByBalanceGreaterThan(BigDecimal balance);

    // Find accounts with balance less than the given amount
    List<BankAccount> findByBalanceLessThan(BigDecimal balance);
}