package com.cafeteria.api.application.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        CategoryResponse category,
        boolean available,
        int stock,
        List<ProductImageResponse> images
) {}
