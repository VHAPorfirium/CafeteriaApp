package com.cafeteria.api.application.mapper;

import com.cafeteria.api.application.dto.response.NotificationResponse;
import com.cafeteria.api.domain.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
