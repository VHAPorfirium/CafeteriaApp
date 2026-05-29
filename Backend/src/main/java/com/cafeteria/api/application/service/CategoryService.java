package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.CategoryRequest;
import com.cafeteria.api.application.dto.response.CategoryResponse;
import com.cafeteria.api.application.mapper.CategoryMapper;
import com.cafeteria.api.domain.entity.Category;
import com.cafeteria.api.domain.repository.CategoryRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * CRUD de categorias do catálogo. {@code slug} é UNIQUE — usamos ele para filtrar
 * produtos na rota pública ({@code /api/products?category=cafes}).
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Já existe categoria com slug: " + request.slug());
        }
        Category category = categoryMapper.toEntity(request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", id));
        categoryMapper.updateEntity(category, request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }
}
