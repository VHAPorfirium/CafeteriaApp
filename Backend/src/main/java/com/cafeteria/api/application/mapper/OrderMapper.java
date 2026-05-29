package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.OrderItemResponse;
import com.cafeteria.api.application.dto.response.OrderResponse;
import com.cafeteria.api.domain.entity.Order;
import com.cafeteria.api.domain.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId",   source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "items",    source = "items")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    OrderItemResponse toItemResponse(OrderItem item);
}
