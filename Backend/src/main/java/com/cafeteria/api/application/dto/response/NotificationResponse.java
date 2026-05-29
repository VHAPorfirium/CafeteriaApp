package com.cafeteria.api.application.dto.response;

import com.cafeteria.api.domain.enums.NotificationType;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        Instant createdAt
) {}
