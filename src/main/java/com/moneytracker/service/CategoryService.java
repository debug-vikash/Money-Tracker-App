package com.moneytracker.service;

import com.moneytracker.dto.CategoryRequest;
import com.moneytracker.dto.CategoryResponse;
import com.moneytracker.exception.ResourceNotFoundException;
import com.moneytracker.model.Category;
import com.moneytracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getCategoriesByType(Category.TransactionType type) {
        return categoryRepository.findByType(type).stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getDefaultCategories() {
        return categoryRepository.findByIsDefaultTrue().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return CategoryResponse.fromEntity(category);
    }

    public Category getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(false)
                .build();

        category = categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        category = categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        categoryRepository.deleteById(id);
    }
}
