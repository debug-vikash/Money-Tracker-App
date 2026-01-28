package com.moneytracker.repository;

import com.moneytracker.model.Category;
import com.moneytracker.model.Transaction;
import com.moneytracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

        List<Transaction> findByUserOrderByTransactionDateDesc(User user);

        List<Transaction> findByUserAndTransactionDateOrderByCreatedAtDesc(User user, LocalDate date);

        List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                        User user, LocalDate startDate, LocalDate endDate);

        List<Transaction> findByUserAndTypeOrderByTransactionDateDesc(
                        User user, Category.TransactionType type);

        List<Transaction> findByUserAndCategoryOrderByTransactionDateDesc(User user, Category category);

        List<Transaction> findByUserAndTypeAndTransactionDateBetween(
                        User user, Category.TransactionType type, LocalDate startDate, LocalDate endDate);

        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type " +
                        "AND t.transactionDate BETWEEN :startDate AND :endDate")
        BigDecimal sumAmountByUserAndTypeAndDateBetween(
                        @Param("user") User user,
                        @Param("type") Category.TransactionType type,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type " +
                        "AND t.transactionDate = :date")
        BigDecimal sumAmountByUserAndTypeAndDate(
                        @Param("user") User user,
                        @Param("type") Category.TransactionType type,
                        @Param("date") LocalDate date);

        @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user " +
                        "AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate " +
                        "GROUP BY t.category ORDER BY SUM(t.amount) DESC")
        List<Object[]> sumAmountGroupByCategory(
                        @Param("user") User user,
                        @Param("type") Category.TransactionType type,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.category = :category " +
                        "AND t.type = 'EXPENSE' AND EXTRACT(MONTH FROM t.transactionDate) = :month AND EXTRACT(YEAR FROM t.transactionDate) = :year")
        BigDecimal sumExpenseByUserAndCategoryAndMonthYear(
                        @Param("user") User user,
                        @Param("category") Category category,
                        @Param("month") Integer month,
                        @Param("year") Integer year);

        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user " +
                        "AND t.type = 'EXPENSE' AND EXTRACT(MONTH FROM t.transactionDate) = :month AND EXTRACT(YEAR FROM t.transactionDate) = :year")
        BigDecimal sumTotalExpenseByUserAndMonthYear(
                        @Param("user") User user,
                        @Param("month") Integer month,
                        @Param("year") Integer year);
}
