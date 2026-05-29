package com.cafeteria.api.application.dto.response;

import java.util.UUID;

public record UploadImageResponse(
        UUID id,
        String url,
        boolean primary
) {}
