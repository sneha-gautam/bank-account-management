package com.api.bank.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.api.bank.exception.AccountNotFoundException;
import com.api.bank.exception.InsufficientBalanceException;
import com.api.bank.exception.InvalidAmountException;
import com.api.bank.model.BankAccount;
import com.api.bank.repository.BankAccountRepository;

import jakarta.transaction.Transactional;

@Service
public class BankAccountService {

    private static final Logger logger =
            LoggerFactory.getLogger(BankAccountService.class);

    private final BankAccountRepository repository;
    private final TransactionService transactionService;

    public BankAccountService(
            BankAccountRepository repository,
            TransactionService transactionService) {

        this.repository = repository;
        this.transactionService = transactionService;
    }

    // Open a new bank account
    public BankAccount openAccount(BankAccount account) {

        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.ZERO);
        }

        if (account.getBalance().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAmountException(
                    "Initial balance cannot be negative");
        }

        if (account.getStatus() == null ||
                account.getStatus().isBlank()) {

            account.setStatus("ACTIVE");
        }

        account.setCreatedAt(java.time.LocalDateTime.now());
        account.setUpdatedAt(java.time.LocalDateTime.now());

        logger.info("Opening bank account for customer: {}",
                account.getCustomerName());

        BankAccount savedAccount = repository.save(account);

        logger.info("Bank account opened successfully: accountId={}",
                savedAccount.getId());

        return savedAccount;
    }

    // Get all bank accounts
    public List<BankAccount> getAllAccounts() {
        return repository.findAll();
    }

    // Get account by ID
    public BankAccount getAccountById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));
    }

    // Update account details
    public BankAccount updateAccount(
            Long id,
            BankAccount updatedAccount) {

        BankAccount existingAccount = repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));

        existingAccount.setCustomerName(
                updatedAccount.getCustomerName());

        existingAccount.setEmail(
                updatedAccount.getEmail());

        existingAccount.setPhone(
                updatedAccount.getPhone());

        existingAccount.setAccountType(
                updatedAccount.getAccountType());

        existingAccount.setUpdatedAt(
                java.time.LocalDateTime.now());

        BankAccount savedAccount = repository.save(existingAccount);

        logger.info("Account updated successfully: accountId={}", id);

        return savedAccount;
    }

    // Close bank account
    public BankAccount closeAccount(Long id) {

        BankAccount account = repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));

        account.setStatus("CLOSED");

        BankAccount closedAccount = repository.save(account);

        logger.info("Account closed successfully: accountId={}", id);

        return closedAccount;
    }

    // Deposit money
    public BankAccount deposit(
            Long id,
            BigDecimal amount) {

        validateAmount(amount);

        logger.info(
                "Deposit requested: accountId={}, amount={}",
                id, amount);

        BankAccount account = repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));

        account.setBalance(
                account.getBalance().add(amount));

        BankAccount updatedAccount = repository.save(account);

        transactionService.saveTransaction(
                account.getAccountNumber(),
                "DEPOSIT",
                amount,
                account.getBalance()
        );

        logger.info(
                "Deposit successful: accountId={}, newBalance={}",
                id, account.getBalance());

        return updatedAccount;
    }

    // Withdraw money
    public BankAccount withdraw(
            Long id,
            BigDecimal amount) {

        validateAmount(amount);

        logger.info(
                "Withdrawal requested: accountId={}, amount={}",
                id, amount);

        BankAccount account = repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance");
        }

        account.setBalance(
                account.getBalance().subtract(amount));

        BankAccount updatedAccount = repository.save(account);

        transactionService.saveTransaction(
                account.getAccountNumber(),
                "WITHDRAW",
                amount,
                account.getBalance()
        );

        logger.info(
                "Withdrawal successful: accountId={}, newBalance={}",
                id, account.getBalance());

        return updatedAccount;
    }

    // Check account balance
    public BigDecimal getBalance(Long id) {

        BankAccount account = repository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found with id: " + id));

        logger.debug(
                "Balance checked: accountId={}, balance={}",
                id, account.getBalance());

        return account.getBalance();
    }

    // Transfer money between accounts
    @Transactional
    public boolean transfer(
            Long fromId,
            Long toId,
            BigDecimal amount) {

        validateAmount(amount);

        logger.info(
                "Transfer requested: fromAccount={}, toAccount={}, amount={}",
                fromId, toId, amount);

        if (fromId.equals(toId)) {
            throw new InvalidAmountException(
                    "Source and destination accounts must be different");
        }

        BankAccount fromAccount = repository.findById(fromId)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Source account not found with id: "
                                        + fromId));

        BankAccount toAccount = repository.findById(toId)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Destination account not found with id: "
                                        + toId));

        if (fromAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance in source account");
        }

        fromAccount.setBalance(
                fromAccount.getBalance().subtract(amount));

        toAccount.setBalance(
                toAccount.getBalance().add(amount));

        repository.save(fromAccount);
        repository.save(toAccount);

        transactionService.saveTransaction(
                fromAccount.getAccountNumber(),
                "TRANSFER_OUT",
                amount,
                fromAccount.getBalance()
        );

        transactionService.saveTransaction(
                toAccount.getAccountNumber(),
                "TRANSFER_IN",
                amount,
                toAccount.getBalance()
        );

        logger.info(
                "Transfer successful: fromAccount={}, toAccount={}, amount={}",
                fromId, toId, amount);

        return true;
    }

    // Search accounts by customer name
    public List<BankAccount> searchByCustomerName(
            String customerName) {

        return repository.findByCustomerNameContainingIgnoreCase(
                customerName);
    }

    // Search accounts by account type
    public List<BankAccount> searchByAccountType(
            String accountType) {

        return repository.findByAccountTypeIgnoreCase(
                accountType);
    }

    // Search accounts by status
    public List<BankAccount> searchByStatus(
            String status) {

        return repository.findByStatusIgnoreCase(status);
    }

    // Find accounts with balance greater than given amount
    public List<BankAccount> findAccountsAboveBalance(
            BigDecimal balance) {

        return repository.findByBalanceGreaterThan(balance);
    }

    // Find accounts with balance less than given amount
    public List<BankAccount> findAccountsBelowBalance(
            BigDecimal balance) {

        return repository.findByBalanceLessThan(balance);
    }

    // Validate transaction amount
    private void validateAmount(BigDecimal amount) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new InvalidAmountException(
                    "Amount must be greater than zero");
        }
    }
}