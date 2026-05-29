package com.cafeteria.api.application.dto.request;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record ReviewRequest(
        @NotNull UUID productId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 2000) String comment
) {}
