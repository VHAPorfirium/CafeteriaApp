package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.CartItemResponse;
import com.cafeteria.api.application.dto.response.CartResponse;
import com.cafeteria.api.domain.entity.Cart;
import com.cafeteria.api.domain.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();
        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int count = items.stream().mapToInt(CartItemResponse::quantity).sum();
        return new CartResponse(cart.getId(), items, total, count);
    }

    public CartItemResponse toItemResponse(CartItem item) {
        BigDecimal unit = item.getProduct().getPrice();
        BigDecimal subtotal = unit.multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                unit,
                item.getQuantity(),
                subtotal
        );
    }
}
