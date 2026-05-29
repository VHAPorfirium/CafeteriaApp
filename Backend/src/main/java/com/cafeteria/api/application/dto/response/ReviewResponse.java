package com.cafeteria.api.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID userId,
        String userName,
        UUID productId,
        int rating,
        String comment,
        Instant createdAt
) {}
