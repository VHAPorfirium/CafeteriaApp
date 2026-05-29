package com.cafeteria.api.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record FavoriteResponse(
        UUID id,
        ProductResponse product,
        Instant createdAt
) {}
