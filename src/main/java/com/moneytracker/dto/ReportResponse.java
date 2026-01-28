package com.moneytracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private Integer transactionCount;
    private List<TransactionResponse> transactions;
    private List<DailySummary> dailySummaries;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailySummary {
        private LocalDate date;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal net;
    }
}
