package com.moneytracker.repository;

import com.moneytracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByType(Category.TransactionType type);

    List<Category> findByIsDefaultTrue();
}
