package com.api.bank.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.api.bank.model.Transaction;
import com.api.bank.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    // Get transaction history for an account
    @GetMapping("/account/{accountNumber}")
    public List<Transaction> getTransactionsByAccount(
            @PathVariable String accountNumber) {

        return service.getTransactionsByAccount(accountNumber);
    }
}