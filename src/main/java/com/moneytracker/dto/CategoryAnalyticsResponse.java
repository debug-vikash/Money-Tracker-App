package com.moneytracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAnalyticsResponse {
    private List<CategoryBreakdown> incomeByCategory;
    private List<CategoryBreakdown> expenseByCategory;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryBreakdown {
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        private BigDecimal amount;
        private Double percentage;
    }
}
