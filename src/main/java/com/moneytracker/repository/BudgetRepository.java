package com.moneytracker.repository;

import com.moneytracker.model.Budget;
import com.moneytracker.model.Category;
import com.moneytracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);

    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(
            User user, Category category, Integer month, Integer year);

    Optional<Budget> findByUserAndCategoryIsNullAndMonthAndYear(
            User user, Integer month, Integer year);
}
