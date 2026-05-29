package com.cafeteria.api.application.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 5000) String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @NotNull UUID categoryId,
        @Size(max = 500) String imageUrl,
        @NotNull Boolean available,
        @NotNull @Min(0) Integer stock
) {}
