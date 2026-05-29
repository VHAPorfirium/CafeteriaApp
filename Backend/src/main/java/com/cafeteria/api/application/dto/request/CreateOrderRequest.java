package com.cafeteria.api.application.dto.request;

import com.cafeteria.api.domain.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 500) String notes
) {}
