package com.moneytracker.service;

import com.moneytracker.dto.BudgetRequest;
import com.moneytracker.dto.BudgetResponse;
import com.moneytracker.exception.BadRequestException;
import com.moneytracker.exception.ResourceNotFoundException;
import com.moneytracker.model.Budget;
import com.moneytracker.model.Category;
import com.moneytracker.model.User;
import com.moneytracker.repository.BudgetRepository;
import com.moneytracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final UserService userService;

    public List<BudgetResponse> getBudgetsForMonth(Integer month, Integer year) {
        User user = userService.getCurrentUser();
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        List<BudgetResponse> responses = new ArrayList<>();

        for (Budget budget : budgets) {
            BigDecimal spent = getSpentAmount(user, budget.getCategory(), month, year);
            responses.add(BudgetResponse.fromEntity(budget, spent));
        }

        return responses;
    }

    public List<BudgetResponse> getCurrentMonthBudgets() {
        LocalDate now = LocalDate.now();
        return getBudgetsForMonth(now.getMonthValue(), now.getYear());
    }

    public List<BudgetResponse> getBudgetStatus() {
        return getCurrentMonthBudgets();
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = userService.getCurrentUser();
        Category category = null;

        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntityById(request.getCategoryId());

            // Check if budget already exists for this category and period
            if (budgetRepository.findByUserAndCategoryAndMonthAndYear(
                    user, category, request.getMonth(), request.getYear()).isPresent()) {
                throw new BadRequestException("Budget already exists for this category and period");
            }
        } else {
            // Check if overall budget already exists for this period
            if (budgetRepository.findByUserAndCategoryIsNullAndMonthAndYear(
                    user, request.getMonth(), request.getYear()).isPresent()) {
                throw new BadRequestException("Overall budget already exists for this period");
            }
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .build();

        budget = budgetRepository.save(budget);

        BigDecimal spent = getSpentAmount(user, category, request.getMonth(), request.getYear());
        return BudgetResponse.fromEntity(budget, spent);
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User user = userService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Budget", "id", id);
        }

        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        if (request.getCategoryId() != null) {
            Category category = categoryService.getCategoryEntityById(request.getCategoryId());
            budget.setCategory(category);
        }

        budget = budgetRepository.save(budget);

        BigDecimal spent = getSpentAmount(user, budget.getCategory(), budget.getMonth(), budget.getYear());
        return BudgetResponse.fromEntity(budget, spent);
    }

    @Transactional
    public void deleteBudget(Long id) {
        User user = userService.getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Budget", "id", id);
        }

        budgetRepository.delete(budget);
    }

    private BigDecimal getSpentAmount(User user, Category category, Integer month, Integer year) {
        BigDecimal spent;
        if (category != null) {
            spent = transactionRepository.sumExpenseByUserAndCategoryAndMonthYear(user, category, month, year);
        } else {
            spent = transactionRepository.sumTotalExpenseByUserAndMonthYear(user, month, year);
        }
        return spent != null ? spent : BigDecimal.ZERO;
    }
}
