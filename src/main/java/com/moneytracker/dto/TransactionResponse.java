package com.moneytracker.dto;

import com.moneytracker.model.Category;
import com.moneytracker.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private Category.TransactionType type;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private LocalDate transactionDate;
    private String notes;
    private LocalDateTime createdAt;

    public static TransactionResponse fromEntity(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .categoryIcon(transaction.getCategory().getIcon())
                .categoryColor(transaction.getCategory().getColor())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
