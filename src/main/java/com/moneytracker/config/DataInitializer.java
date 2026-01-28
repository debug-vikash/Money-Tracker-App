package com.moneytracker.config;

import com.moneytracker.model.Category;
import com.moneytracker.model.Role;
import com.moneytracker.repository.CategoryRepository;
import com.moneytracker.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        initRoles();
        initCategories();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            Role userRole = Role.builder().name(Role.ROLE_USER).build();
            Role adminRole = Role.builder().name(Role.ROLE_ADMIN).build();
            roleRepository.saveAll(List.of(userRole, adminRole));
            log.info("Default roles created");
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                    // Income categories
                    Category.builder()
                            .name("Salary")
                            .type(Category.TransactionType.INCOME)
                            .icon("💰")
                            .color("#4CAF50")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Freelance")
                            .type(Category.TransactionType.INCOME)
                            .icon("💻")
                            .color("#2196F3")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Investment")
                            .type(Category.TransactionType.INCOME)
                            .icon("📈")
                            .color("#9C27B0")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Gift")
                            .type(Category.TransactionType.INCOME)
                            .icon("🎁")
                            .color("#E91E63")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Other Income")
                            .type(Category.TransactionType.INCOME)
                            .icon("💵")
                            .color("#607D8B")
                            .isDefault(true)
                            .build(),

                    // Expense categories
                    Category.builder()
                            .name("Food & Dining")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🍔")
                            .color("#FF5722")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Transportation")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🚗")
                            .color("#3F51B5")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Shopping")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🛍️")
                            .color("#E91E63")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Entertainment")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🎬")
                            .color("#673AB7")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Bills & Utilities")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("📱")
                            .color("#00BCD4")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Healthcare")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🏥")
                            .color("#F44336")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Education")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("📚")
                            .color("#795548")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Travel")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("✈️")
                            .color("#009688")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Rent")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("🏠")
                            .color("#FF9800")
                            .isDefault(true)
                            .build(),
                    Category.builder()
                            .name("Other Expense")
                            .type(Category.TransactionType.EXPENSE)
                            .icon("📋")
                            .color("#9E9E9E")
                            .isDefault(true)
                            .build());

            categoryRepository.saveAll(categories);
            log.info("Default categories created");
        }
    }
}
