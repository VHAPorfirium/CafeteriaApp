package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.UserResponse;
import com.cafeteria.api.domain.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
