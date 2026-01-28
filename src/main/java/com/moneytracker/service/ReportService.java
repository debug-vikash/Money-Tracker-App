package com.moneytracker.service;

import com.moneytracker.dto.CategoryAnalyticsResponse;
import com.moneytracker.dto.ReportResponse;
import com.moneytracker.dto.TransactionResponse;
import com.moneytracker.model.Category;
import com.moneytracker.model.Transaction;
import com.moneytracker.model.User;
import com.moneytracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public ReportResponse getDailyReport(LocalDate date) {
        User user = userService.getCurrentUser();
        LocalDate reportDate = date != null ? date : LocalDate.now();

        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateOrderByCreatedAtDesc(user, reportDate);

        BigDecimal totalIncome = sumByType(transactions, Category.TransactionType.INCOME);
        BigDecimal totalExpense = sumByType(transactions, Category.TransactionType.EXPENSE);

        return ReportResponse.builder()
                .startDate(reportDate)
                .endDate(reportDate)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome.subtract(totalExpense))
                .transactionCount(transactions.size())
                .transactions(transactions.stream()
                        .map(TransactionResponse::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    public ReportResponse getWeeklyReport() {
        User user = userService.getCurrentUser();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        return getReportForDateRange(user, startDate, endDate);
    }

    public ReportResponse getMonthlyReport(Integer month, Integer year) {
        User user = userService.getCurrentUser();
        LocalDate now = LocalDate.now();
        int reportMonth = month != null ? month : now.getMonthValue();
        int reportYear = year != null ? year : now.getYear();

        LocalDate startDate = LocalDate.of(reportYear, reportMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return getReportForDateRange(user, startDate, endDate);
    }

    private ReportResponse getReportForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(user, startDate, endDate);

        BigDecimal totalIncome = sumByType(transactions, Category.TransactionType.INCOME);
        BigDecimal totalExpense = sumByType(transactions, Category.TransactionType.EXPENSE);

        // Group transactions by date for daily summaries
        Map<LocalDate, List<Transaction>> transactionsByDate = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getTransactionDate));

        List<ReportResponse.DailySummary> dailySummaries = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Transaction> dayTransactions = transactionsByDate.getOrDefault(date, new ArrayList<>());
            BigDecimal dayIncome = sumByType(dayTransactions, Category.TransactionType.INCOME);
            BigDecimal dayExpense = sumByType(dayTransactions, Category.TransactionType.EXPENSE);

            dailySummaries.add(ReportResponse.DailySummary.builder()
                    .date(date)
                    .income(dayIncome)
                    .expense(dayExpense)
                    .net(dayIncome.subtract(dayExpense))
                    .build());
        }

        return ReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome.subtract(totalExpense))
                .transactionCount(transactions.size())
                .transactions(transactions.stream()
                        .map(TransactionResponse::fromEntity)
                        .collect(Collectors.toList()))
                .dailySummaries(dailySummaries)
                .build();
    }

    public CategoryAnalyticsResponse getCategoryAnalysis(LocalDate startDate, LocalDate endDate) {
        User user = userService.getCurrentUser();

        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        // Get income breakdown
        List<Object[]> incomeData = transactionRepository.sumAmountGroupByCategory(
                user, Category.TransactionType.INCOME, start, end);

        // Get expense breakdown
        List<Object[]> expenseData = transactionRepository.sumAmountGroupByCategory(
                user, Category.TransactionType.EXPENSE, start, end);

        BigDecimal totalIncome = calculateTotal(incomeData);
        BigDecimal totalExpense = calculateTotal(expenseData);

        List<CategoryAnalyticsResponse.CategoryBreakdown> incomeBreakdown = buildCategoryBreakdown(incomeData,
                totalIncome);
        List<CategoryAnalyticsResponse.CategoryBreakdown> expenseBreakdown = buildCategoryBreakdown(expenseData,
                totalExpense);

        return CategoryAnalyticsResponse.builder()
                .incomeByCategory(incomeBreakdown)
                .expenseByCategory(expenseBreakdown)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .build();
    }

    private BigDecimal sumByType(List<Transaction> transactions, Category.TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotal(List<Object[]> data) {
        return data.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoryAnalyticsResponse.CategoryBreakdown> buildCategoryBreakdown(
            List<Object[]> data, BigDecimal total) {

        return data.stream()
                .map(row -> {
                    Category category = (Category) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    double percentage = total.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(total, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue()
                            : 0.0;

                    return CategoryAnalyticsResponse.CategoryBreakdown.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .categoryIcon(category.getIcon())
                            .categoryColor(category.getColor())
                            .amount(amount)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
