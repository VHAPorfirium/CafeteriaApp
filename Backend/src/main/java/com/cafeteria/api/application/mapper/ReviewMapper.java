package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.ReviewResponse;
import com.cafeteria.api.domain.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "userId",    source = "user.id")
    @Mapping(target = "userName",  source = "user.name")
    @Mapping(target = "productId", source = "product.id")
    ReviewResponse toResponse(Review review);
}
