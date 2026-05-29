package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.ProductImageResponse;
import com.cafeteria.api.application.dto.response.ProductResponse;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface ProductMapper {

    @Mapping(target = "category", source = "category")
    @Mapping(target = "images", source = "images")
    ProductResponse toResponse(Product product);

    ProductImageResponse toImageResponse(ProductImage image);
}
