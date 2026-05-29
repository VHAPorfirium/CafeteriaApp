package com.cafeteria.api.application.dto.response;

import java.util.UUID;

public record ProductImageResponse(
        UUID id,
        String url,
        boolean primary,
        int displayOrder
) {}
