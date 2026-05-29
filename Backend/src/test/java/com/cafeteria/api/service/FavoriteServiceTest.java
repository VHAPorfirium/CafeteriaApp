package com.cafeteria.api.service;

import com.cafeteria.api.application.mapper.FavoriteMapper;
import com.cafeteria.api.application.service.FavoriteService;
import com.cafeteria.api.domain.repository.FavoriteRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock FavoriteRepository favoriteRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock FavoriteMapper favoriteMapper;

    @InjectMocks FavoriteService favoriteService;

    @Test
    void add_deveLancarSeJaExiste() {
        UUID u = UUID.randomUUID();
        UUID p = UUID.randomUUID();
        when(favoriteRepository.existsByUserIdAndProductId(u, p)).thenReturn(true);
        assertThatThrownBy(() -> favoriteService.add(u, p))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void remove_deveLancarSeNaoExiste() {
        UUID u = UUID.randomUUID();
        UUID p = UUID.randomUUID();
        when(favoriteRepository.existsByUserIdAndProductId(u, p)).thenReturn(false);
        assertThatThrownBy(() -> favoriteService.remove(u, p))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
