package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.response.CategoryResponse;
import com.cafeteria.api.application.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Listagem pública de categorias ativas, ordenadas por displayOrder.
 */
@Tag(name = "Categorias (público)")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lista categorias ativas")
    public List<CategoryResponse> list() {
        return categoryService.listActive();
    }
}
