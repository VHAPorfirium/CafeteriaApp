package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.request.CategoryRequest;
import com.cafeteria.api.application.dto.response.CategoryResponse;
import com.cafeteria.api.domain.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "displayOrder", source = "displayOrder", defaultValue = "0")
    Category toEntity(CategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(@MappingTarget Category entity, CategoryRequest request);
}
