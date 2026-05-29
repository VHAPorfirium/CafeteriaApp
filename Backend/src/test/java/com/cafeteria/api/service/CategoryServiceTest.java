package com.cafeteria.api.service;

import com.cafeteria.api.application.dto.request.CategoryRequest;
import com.cafeteria.api.application.dto.response.CategoryResponse;
import com.cafeteria.api.application.mapper.CategoryMapper;
import com.cafeteria.api.application.service.CategoryService;
import com.cafeteria.api.domain.entity.Category;
import com.cafeteria.api.domain.repository.CategoryRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @Mock CategoryMapper categoryMapper;

    @InjectMocks CategoryService categoryService;

    @Test
    void create_deveSalvar() {
        CategoryRequest req = new CategoryRequest("Cafés", "cafes", "desc", 1);
        Category entity = Category.builder().id(UUID.randomUUID()).name("Cafés").slug("cafes").active(true).build();
        when(categoryRepository.existsBySlug("cafes")).thenReturn(false);
        when(categoryMapper.toEntity(req)).thenReturn(entity);
        when(categoryRepository.save(entity)).thenReturn(entity);
        CategoryResponse mapped = new CategoryResponse(entity.getId(), "Cafés", "cafes", "desc", true, 1);
        when(categoryMapper.toResponse(entity)).thenReturn(mapped);

        CategoryResponse result = categoryService.create(req);
        assertThat(result.slug()).isEqualTo("cafes");
    }

    @Test
    void create_deveLancarSeSlugDuplicado() {
        when(categoryRepository.existsBySlug("cafes")).thenReturn(true);
        assertThatThrownBy(() ->
                categoryService.create(new CategoryRequest("X", "cafes", null, 0)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void update_deveLancarSeNaoExiste() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() ->
                categoryService.update(id, new CategoryRequest("a", "b", null, 0)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_devePersistirDelta() {
        UUID id = UUID.randomUUID();
        Category existing = Category.builder().id(id).name("old").slug("old").active(true).build();
        when(categoryRepository.findById(id)).thenReturn(Optional.of(existing));
        CategoryRequest req = new CategoryRequest("new", "new-slug", "d", 2);
        when(categoryRepository.save(existing)).thenReturn(existing);
        when(categoryMapper.toResponse(existing))
                .thenReturn(new CategoryResponse(id, "new", "new-slug", "d", true, 2));

        CategoryResponse out = categoryService.update(id, req);
        assertThat(out.name()).isEqualTo("new");
        verify(categoryMapper).updateEntity(eq(existing), eq(req));
    }
}
