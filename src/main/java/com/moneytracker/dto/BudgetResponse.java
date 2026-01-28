package com.moneytracker.dto;

import com.moneytracker.model.Budget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private Long id;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private Long categoryId;
    private String categoryName;
    private Integer month;
    private Integer year;
    private boolean exceeded;

    public static BudgetResponse fromEntity(Budget budget, BigDecimal spentAmount) {
        BigDecimal spent = spentAmount != null ? spentAmount : BigDecimal.ZERO;
        BigDecimal remaining = budget.getAmount().subtract(spent);
        double percentage = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.doubleValue() / budget.getAmount().doubleValue() * 100
                : 0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .budgetAmount(budget.getAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(Math.round(percentage * 100.0) / 100.0)
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : "Overall")
                .month(budget.getMonth())
                .year(budget.getYear())
                .exceeded(remaining.compareTo(BigDecimal.ZERO) < 0)
                .build();
    }
}
