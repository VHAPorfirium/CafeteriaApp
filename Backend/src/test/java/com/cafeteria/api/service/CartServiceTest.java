package com.cafeteria.api.service;

import com.cafeteria.api.application.dto.request.CartItemRequest;
import com.cafeteria.api.application.dto.response.CartResponse;
import com.cafeteria.api.application.mapper.CartMapper;
import com.cafeteria.api.application.service.CartService;
import com.cafeteria.api.domain.entity.Cart;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.enums.UserRole;
import com.cafeteria.api.domain.repository.CartItemRepository;
import com.cafeteria.api.domain.repository.CartRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.InsufficientStockException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartRepository cartRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock CartMapper cartMapper;

    @InjectMocks CartService cartService;

    @Test
    void addItem_deveLancarSeProdutoIndisponivel() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("X").email("x@b.com").role(UserRole.USER).active(true).build();
        Cart cart = Cart.builder().id(UUID.randomUUID()).user(user).build();
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().id(productId).name("P").price(BigDecimal.TEN)
                .stock(10).available(false).active(true).build();

        lenient().when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));

        assertThatThrownBy(() ->
                cartService.addItem(userId, new CartItemRequest(productId, 1)))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void addItem_deveLancarSeEstoqueAbaixoQuantidade() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("X").email("x@b.com").role(UserRole.USER).active(true).build();
        Cart cart = Cart.builder().id(UUID.randomUUID()).user(user).build();
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().id(productId).name("P").price(BigDecimal.TEN)
                .stock(2).available(true).active(true).build();

        lenient().when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCartIdAndProductId(cart.getId(), productId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                cartService.addItem(userId, new CartItemRequest(productId, 5)))
                .isInstanceOf(InsufficientStockException.class);
    }
}
