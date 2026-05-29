package com.cafeteria.api.service;

import com.cafeteria.api.application.dto.request.CreateOrderRequest;
import com.cafeteria.api.application.dto.response.OrderItemResponse;
import com.cafeteria.api.application.dto.response.OrderResponse;
import com.cafeteria.api.application.mapper.OrderMapper;
import com.cafeteria.api.application.service.NotificationService;
import com.cafeteria.api.application.service.OrderService;
import com.cafeteria.api.domain.entity.*;
import com.cafeteria.api.domain.enums.OrderStatus;
import com.cafeteria.api.domain.enums.PaymentMethod;
import com.cafeteria.api.domain.enums.UserRole;
import com.cafeteria.api.domain.repository.*;
import com.cafeteria.api.exception.BusinessException;
import com.cafeteria.api.exception.InsufficientStockException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartRepository cartRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock OrderMapper orderMapper;
    @Mock NotificationService notificationService;
    @Mock SimpMessagingTemplate messagingTemplate;

    @InjectMocks OrderService orderService;

    @Test
    void create_deveLancarSeCarrinhoVazio() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("X").email("x@b.com").role(UserRole.USER).active(true).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Cart cart = Cart.builder().id(UUID.randomUUID()).user(user).build();
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() ->
                orderService.create(userId, new CreateOrderRequest(PaymentMethod.PIX, null), null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Carrinho vazio");
    }

    @Test
    void create_deveLancarSeEstoqueInsuficiente() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("X").email("x@b.com").role(UserRole.USER).active(true).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Product product = Product.builder().id(UUID.randomUUID()).name("P").price(BigDecimal.TEN)
                .stock(1).available(true).active(true).build();
        Cart cart = Cart.builder().id(UUID.randomUUID()).user(user).build();
        CartItem item = CartItem.builder().id(UUID.randomUUID()).cart(cart).product(product)
                .quantity(5).build();
        cart.getItems().add(item);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(productRepository.findByIdWithLock(product.getId())).thenReturn(Optional.of(product));

        assertThatThrownBy(() ->
                orderService.create(userId, new CreateOrderRequest(PaymentMethod.PIX, null), null))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void create_deveRetornarPedidoExistenteQuandoIdempotencyKey() {
        UUID userId = UUID.randomUUID();
        Order existing = Order.builder().id(UUID.randomUUID())
                .status(OrderStatus.PENDING).total(BigDecimal.TEN).paymentMethod(PaymentMethod.PIX).build();
        when(orderRepository.findByIdempotencyKey("idem-123")).thenReturn(Optional.of(existing));
        OrderResponse mocked = new OrderResponse(existing.getId(), userId, "X",
                OrderStatus.PENDING, BigDecimal.TEN, PaymentMethod.PIX, List.<OrderItemResponse>of(),
                Instant.now(), Instant.now());
        when(orderMapper.toResponse(existing)).thenReturn(mocked);

        OrderResponse result = orderService.create(userId,
                new CreateOrderRequest(PaymentMethod.PIX, null), "idem-123");

        verify(orderRepository, never()).save(any());
        org.assertj.core.api.Assertions.assertThat(result).isEqualTo(mocked);
    }
}
