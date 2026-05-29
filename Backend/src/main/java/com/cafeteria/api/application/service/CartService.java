package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.CartItemRequest;
import com.cafeteria.api.application.dto.request.UpdateCartItemRequest;
import com.cafeteria.api.application.dto.response.CartResponse;
import com.cafeteria.api.application.mapper.CartMapper;
import com.cafeteria.api.domain.entity.Cart;
import com.cafeteria.api.domain.entity.CartItem;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.repository.CartItemRepository;
import com.cafeteria.api.domain.repository.CartRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.InsufficientStockException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Service do carrinho. Cada operação (add / update / remove) recarrega o
 * estado completo do cart antes de devolver, para que o frontend possa
 * substituir o cache local sem precisar de refetch.
 *
 * Importante: ao alterar CartItems, atualizamos a coleção em memória do
 * Cart também, porque o Hibernate NÃO sincroniza automaticamente a coleção
 * @OneToMany quando o lado dono (CartItem) é salvo.
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional
    public CartResponse getMyCart(UUID userId) {
        return cartMapper.toResponse(getOrCreate(userId));
    }

    @Transactional
    public CartResponse addItem(UUID userId, CartItemRequest request) {
        Cart cart = getOrCreate(userId);
        Product product = productRepository.findByIdAndActiveTrue(request.productId())
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", request.productId()));
        if (!product.isAvailable()) {
            throw new InsufficientStockException("Produto indisponível: " + product.getName());
        }

        Optional<CartItem> existing = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId());

        CartItem item = existing.orElseGet(() ->
                CartItem.builder().cart(cart).product(product).quantity(0).build());

        int newQty = item.getQuantity() + request.quantity();
        if (product.getStock() < newQty) {
            throw new InsufficientStockException(
                    "Estoque insuficiente para " + product.getName() +
                            " (disponível: " + product.getStock() + ")");
        }
        item.setQuantity(newQty);
        item = cartItemRepository.save(item);

        // Sincroniza a coleção do cart em memória — sem isso, a response sai
        // sem o item recém-adicionado e o front pensa que o carrinho está vazio.
        if (existing.isEmpty()) {
            cart.getItems().add(item);
        }

        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(UUID userId, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreate(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> ResourceNotFoundException.of("Item do carrinho", itemId));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Item não pertence ao seu carrinho");
        }
        if (item.getProduct().getStock() < request.quantity()) {
            throw new InsufficientStockException("Estoque insuficiente");
        }
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreate(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> ResourceNotFoundException.of("Item do carrinho", itemId));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResourceNotFoundException("Item não pertence ao seu carrinho");
        }
        // Remove da coleção em memória ANTES do delete para que o mapper
        // veja o cart sem o item removido.
        cart.getItems().removeIf(ci -> ci.getId().equals(item.getId()));
        cartItemRepository.delete(item);
        return cartMapper.toResponse(cart);
    }

    /**
     * Garante que o usuário tenha um Cart. Se não houver, cria vazio.
     */
    Cart getOrCreate(UUID userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ResourceNotFoundException.of("Usuário", userId));
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }
}
