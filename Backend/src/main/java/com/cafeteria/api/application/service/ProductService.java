package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.ProductRequest;
import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.dto.response.ProductResponse;
import com.cafeteria.api.application.mapper.ProductMapper;
import com.cafeteria.api.domain.entity.Category;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.repository.CategoryRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Regras de negócio do catálogo (produto).
 *
 * <p>Importante: {@link #softDelete(java.util.UUID)} usa <b>soft delete</b>
 * (flag {@code active=false}) para preservar a integridade de pedidos antigos
 * que referenciam o produto. Um hard delete quebraria o histórico.
 *
 * <p>Toda alteração relevante de estoque emite um evento broadcast em
 * {@code /topic/products/stock} via STOMP.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(String categorySlug, String search, Pageable pageable) {
        return PageResponse.from(
                productRepository.search(categorySlug, search, pageable),
                productMapper::toResponse
        );
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", id));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", request.categoryId()));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .category(category)
                .available(Boolean.TRUE.equals(request.available()))
                .active(true)
                .stock(request.stock())
                .build();
        product = productRepository.save(product);
        broadcastStock(product);
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", id));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", request.categoryId()));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);
        product.setAvailable(Boolean.TRUE.equals(request.available()));
        product.setStock(request.stock());

        product = productRepository.save(product);
        broadcastStock(product);
        return productMapper.toResponse(product);
    }

    @Transactional
    public void softDelete(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", id));
        product.setActive(false);
        product.setAvailable(false);
        productRepository.save(product);
    }

    private void broadcastStock(Product product) {
        messagingTemplate.convertAndSend("/topic/products/stock", Map.of(
                "productId", product.getId().toString(),
                "stock", product.getStock(),
                "available", product.isAvailable()
        ));
    }
}
