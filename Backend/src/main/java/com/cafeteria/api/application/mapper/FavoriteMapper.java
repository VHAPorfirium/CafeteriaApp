package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.FavoriteResponse;
import com.cafeteria.api.domain.entity.Favorite;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface FavoriteMapper {
    FavoriteResponse toResponse(Favorite favorite);
}
