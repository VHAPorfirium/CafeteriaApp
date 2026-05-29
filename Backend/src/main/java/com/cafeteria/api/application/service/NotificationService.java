package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.response.NotificationResponse;
import com.cafeteria.api.application.mapper.NotificationMapper;
import com.cafeteria.api.domain.entity.Notification;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.enums.NotificationType;
import com.cafeteria.api.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cria e despacha notificações privadas para o usuário.
 *
 * <p>Persiste no banco (tabela {@code notifications}) e empurra em tempo real
 * via STOMP para {@code /user/{userId}/queue/notifications}.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationMapper notificationMapper;

    @Transactional
    public void notifyUser(User user, NotificationType type, String title, String message) {
        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .build();
        Notification saved = notificationRepository.save(n);
        NotificationResponse payload = notificationMapper.toResponse(saved);
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                payload);
    }
}
