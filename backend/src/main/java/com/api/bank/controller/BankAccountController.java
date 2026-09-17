package com.api.bank.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.api.bank.model.BankAccount;
import com.api.bank.service.BankAccountService;

@RestController
@RequestMapping("/api/accounts")
public class BankAccountController {

    private final BankAccountService service;

    public BankAccountController(BankAccountService service) {
        this.service = service;
    }

    // Open a new bank account
    @PostMapping
    public BankAccount openAccount(@RequestBody BankAccount account) {
        return service.openAccount(account);
    }

    // Get all bank accounts
    @GetMapping
    public List<BankAccount> getAllAccounts() {
        return service.getAllAccounts();
    }

    // Get account by ID
    @GetMapping("/{id}")
    public BankAccount getAccountById(@PathVariable Long id) {
        return service.getAccountById(id);
    }

    // Update account details
    @PutMapping("/{id}")
    public BankAccount updateAccount(
            @PathVariable Long id,
            @RequestBody BankAccount account) {

        return service.updateAccount(id, account);
    }

    // Close bank account
    @PutMapping("/{id}/close")
    public BankAccount closeAccount(@PathVariable Long id) {
        return service.closeAccount(id);
    }

    // Deposit money
    @PostMapping("/{id}/deposit")
    public BankAccount deposit(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return service.deposit(id, amount);
    }

    // Withdraw money
    @PostMapping("/{id}/withdraw")
    public BankAccount withdraw(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {

        return service.withdraw(id, amount);
    }

    // Check account balance
    @GetMapping("/{id}/balance")
    public BigDecimal getBalance(@PathVariable Long id) {
        return service.getBalance(id);
    }

    // Transfer money between accounts
    @PostMapping("/transfer")
    public boolean transfer(
            @RequestParam Long fromId,
            @RequestParam Long toId,
            @RequestParam BigDecimal amount) {

        return service.transfer(fromId, toId, amount);
    }
    // Search accounts by customer name
@GetMapping("/search/customer")
public List<BankAccount> searchByCustomerName(
        @RequestParam String name) {

    return service.searchByCustomerName(name);
}

// Search accounts by account type
@GetMapping("/search/type")
public List<BankAccount> searchByAccountType(
        @RequestParam String type) {

    return service.searchByAccountType(type);
}

// Search accounts by status
@GetMapping("/search/status")
public List<BankAccount> searchByStatus(
        @RequestParam String status) {

    return service.searchByStatus(status);
}

// Find accounts with balance greater than given amount
@GetMapping("/search/above-balance")
public List<BankAccount> findAccountsAboveBalance(
        @RequestParam BigDecimal amount) {

    return service.findAccountsAboveBalance(amount);
}

// Find accounts with balance less than given amount
@GetMapping("/search/below-balance")
public List<BankAccount> findAccountsBelowBalance(
        @RequestParam BigDecimal amount) {

    return service.findAccountsBelowBalance(amount);
}
}