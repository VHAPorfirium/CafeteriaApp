package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.CreateOrderRequest;
import com.cafeteria.api.application.dto.request.UpdateOrderStatusRequest;
import com.cafeteria.api.application.dto.response.OrderResponse;
import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.mapper.OrderMapper;
import com.cafeteria.api.domain.entity.*;
import com.cafeteria.api.domain.enums.NotificationType;
import com.cafeteria.api.domain.enums.OrderStatus;
import com.cafeteria.api.domain.repository.*;
import com.cafeteria.api.exception.BusinessException;
import com.cafeteria.api.exception.InsufficientStockException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import com.cafeteria.api.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Coração da operação. Lida com criação de pedidos, consulta e mudança de status.
 *
 * <p>Pontos importantes:
 * <ul>
 *   <li><b>Idempotência</b> — se o cliente reenviar {@code POST /api/orders} com o
 *       mesmo header {@code Idempotency-Key}, devolvemos o pedido criado anteriormente
 *       em vez de duplicar. Protege contra double-click no checkout.</li>
 *   <li><b>Lock otimista</b> ({@code @Version} em {@link com.cafeteria.api.domain.entity.Product})
 *       evita oversell em compras concorrentes do mesmo produto.</li>
 *   <li><b>Snapshot do nome</b> — {@code product_name} é gravado em
 *       {@code order_items}, então editar o produto depois não altera pedidos antigos.</li>
 *   <li><b>STOMP</b> — emite eventos em {@code /topic/admin/orders}, em
 *       {@code /topic/products/stock} (por item) e em
 *       {@code /user/{id}/queue/order-updates} no update de status.</li>
 *   <li><b>Máquina de estados</b> — transições válidas estão em
 *       {@link com.cafeteria.api.domain.enums.OrderStatus#canTransitionTo}.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public OrderResponse create(UUID userId, CreateOrderRequest request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return orderMapper.toResponse(existing.get());
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", userId));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Carrinho vazio"));
        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Carrinho vazio");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.paymentMethod())
                .idempotencyKey(idempotencyKey)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cart.getItems()) {
            // lock otimista — recarrega produto
            Product product = productRepository.findByIdWithLock(ci.getProduct().getId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Produto", ci.getProduct().getId()));
            if (product.getStock() < ci.getQuantity()) {
                throw new InsufficientStockException(
                        "Estoque insuficiente para " + product.getName() + " (disponível: " + product.getStock() + ")");
            }
            product.setStock(product.getStock() - ci.getQuantity());
            if (product.getStock() == 0) {
                product.setAvailable(false);
            }
            productRepository.save(product);

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            total = total.add(subtotal);

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(ci.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .notes(request.notes())
                    .build();
            order.getItems().add(oi);

            messagingTemplate.convertAndSend("/topic/products/stock",
                    java.util.Map.of(
                            "productId", product.getId().toString(),
                            "stock", product.getStock(),
                            "available", product.isAvailable()));
        }
        order.setTotal(total);
        Order saved = orderRepository.save(order);

        cart.clear();
        cartRepository.save(cart);

        // Notificações em tempo real
        OrderResponse response = orderMapper.toResponse(saved);
        messagingTemplate.convertAndSend("/topic/admin/orders", response);
        notificationService.notifyUser(user, NotificationType.ORDER_CREATED,
                "Pedido recebido",
                "Seu pedido #" + saved.getId().toString().substring(0, 8) + " foi recebido");

        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> myOrders(UUID userId, Pageable pageable) {
        return PageResponse.from(
                orderRepository.findByUserId(userId, pageable),
                orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId, AuthenticatedUser current) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ResourceNotFoundException.of("Pedido", orderId));
        if (!current.isAdmin() && !order.getUser().getId().equals(current.id())) {
            throw new BusinessException("Você não tem acesso a esse pedido");
        }
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> adminList(OrderStatus status, Pageable pageable) {
        return PageResponse.from(
                orderRepository.searchAdmin(status, pageable),
                orderMapper::toResponse);
    }

    @Transactional
    public OrderResponse updateStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ResourceNotFoundException.of("Pedido", orderId));
        if (!order.getStatus().canTransitionTo(request.status())) {
            throw new BusinessException("Transição inválida: " + order.getStatus() + " -> " + request.status());
        }
        order.setStatus(request.status());
        Order saved = orderRepository.save(order);

        OrderResponse response = orderMapper.toResponse(saved);
        // notifica usuário dono do pedido
        messagingTemplate.convertAndSendToUser(
                saved.getUser().getId().toString(),
                "/queue/order-updates",
                response);
        notificationService.notifyUser(saved.getUser(), NotificationType.ORDER_STATUS_CHANGED,
                "Status do pedido atualizado",
                "Seu pedido #" + saved.getId().toString().substring(0, 8) + " está: " + saved.getStatus());
        return response;
    }
}
