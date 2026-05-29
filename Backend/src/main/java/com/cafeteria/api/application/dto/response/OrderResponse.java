package com.cafeteria.api.application.dto.response;

import com.cafeteria.api.domain.enums.OrderStatus;
import com.cafeteria.api.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID userId,
        String userName,
        OrderStatus status,
        BigDecimal total,
        PaymentMethod paymentMethod,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
