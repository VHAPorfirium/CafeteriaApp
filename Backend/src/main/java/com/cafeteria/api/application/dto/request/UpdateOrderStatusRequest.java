package com.cafeteria.api.application.dto.request;

import com.cafeteria.api.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}
