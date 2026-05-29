package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.dto.response.ProductResponse;
import com.cafeteria.api.application.dto.response.ReviewResponse;
import com.cafeteria.api.application.service.ProductService;
import com.cafeteria.api.application.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints públicos do catálogo (sem auth). Paginação via {@code Pageable}
 * do Spring Data: {@code ?page=0&size=20&sort=price,asc}.
 */
@Tag(name = "Produtos (público)")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Lista produtos com paginação, filtro por categoria e busca")
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return productService.list(category, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe do produto")
    public ProductResponse getById(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Reviews públicas do produto")
    public PageResponse<ReviewResponse> reviews(
            @PathVariable UUID id,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return reviewService.listByProduct(id, pageable);
    }
}
