package com.cafeteria.api.application.dto.response;

import com.cafeteria.api.domain.enums.UserRole;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt
) {}
