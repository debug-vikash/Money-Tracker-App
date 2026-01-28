package com.moneytracker.service;

import com.moneytracker.dto.TransactionRequest;
import com.moneytracker.dto.TransactionResponse;
import com.moneytracker.exception.ResourceNotFoundException;
import com.moneytracker.model.Category;
import com.moneytracker.model.Transaction;
import com.moneytracker.model.User;
import com.moneytracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<TransactionResponse> getAllTransactions() {
        User user = userService.getCurrentUser();
        return transactionRepository.findByUserOrderByTransactionDateDesc(user).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Transaction", "id", id);
        }

        return TransactionResponse.fromEntity(transaction);
    }

    public List<TransactionResponse> getTransactionsByDate(LocalDate date) {
        User user = userService.getCurrentUser();
        return transactionRepository.findByUserAndTransactionDateOrderByCreatedAtDesc(user, date).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        User user = userService.getCurrentUser();
        return transactionRepository
                .findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(user, startDate, endDate).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByType(Category.TransactionType type) {
        User user = userService.getCurrentUser();
        return transactionRepository.findByUserAndTypeOrderByTransactionDateDesc(user, type).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByCategory(Long categoryId) {
        User user = userService.getCurrentUser();
        Category category = categoryService.getCategoryEntityById(categoryId);
        return transactionRepository.findByUserAndCategoryOrderByTransactionDateDesc(user, category).stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> filterTransactions(
            LocalDate startDate,
            LocalDate endDate,
            Category.TransactionType type,
            Long categoryId) {

        User user = userService.getCurrentUser();
        List<Transaction> transactions;

        if (startDate != null && endDate != null) {
            if (type != null) {
                transactions = transactionRepository.findByUserAndTypeAndTransactionDateBetween(
                        user, type, startDate, endDate);
            } else {
                transactions = transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                        user, startDate, endDate);
            }
        } else if (type != null) {
            transactions = transactionRepository.findByUserAndTypeOrderByTransactionDateDesc(user, type);
        } else {
            transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);
        }

        // Apply category filter if provided
        if (categoryId != null) {
            transactions = transactions.stream()
                    .filter(t -> t.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }

        return transactions.stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = userService.getCurrentUser();
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .type(request.getType())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .notes(request.getNotes())
                .build();

        transaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Transaction", "id", id);
        }

        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(
                request.getTransactionDate() != null ? request.getTransactionDate() : transaction.getTransactionDate());
        transaction.setNotes(request.getNotes());

        transaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User user = userService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Transaction", "id", id);
        }

        transactionRepository.delete(transaction);
    }
}
