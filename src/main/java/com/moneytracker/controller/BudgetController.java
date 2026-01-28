package com.moneytracker.controller;

import com.moneytracker.dto.BudgetRequest;
import com.moneytracker.dto.BudgetResponse;
import com.moneytracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getCurrentMonthBudgets() {
        return ResponseEntity.ok(budgetService.getCurrentMonthBudgets());
    }

    @GetMapping("/{month}/{year}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsForMonth(
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return ResponseEntity.ok(budgetService.getBudgetsForMonth(month, year));
    }

    @GetMapping("/status")
    public ResponseEntity<List<BudgetResponse>> getBudgetStatus() {
        return ResponseEntity.ok(budgetService.getBudgetStatus());
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
