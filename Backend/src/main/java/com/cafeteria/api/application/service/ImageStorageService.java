package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.response.UploadImageResponse;
import com.cafeteria.api.config.MinioConfig;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.ProductImage;
import com.cafeteria.api.domain.repository.ProductImageRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.exception.BusinessException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * Upload de imagens dos produtos para o MinIO (S3-compatible).
 *
 * <p>Recebe um {@link MultipartFile}, valida content-type, gera um nome único e
 * envia para {@code /products/{productId}/{uuid}.{ext}} no bucket. A URL pública
 * resultante é persistida em {@code product_images} e (se {@code primary=true})
 * também em {@code products.image_url}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Transactional
    public UploadImageResponse uploadProductImage(UUID productId, MultipartFile file, boolean primary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", productId));

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo vazio");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Apenas imagens são permitidas");
        }

        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) ext = original.substring(dot);
        String objectName = "products/" + productId + "/" + UUID.randomUUID() + ext;

        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(minioConfig.getBucket())
                    .object(objectName)
                    .stream(is, file.getSize(), -1)
                    .contentType(contentType)
                    .build());
        } catch (Exception e) {
            log.error("Falha no upload MinIO", e);
            throw new BusinessException("Falha ao salvar imagem: " + e.getMessage());
        }

        String url = "%s/%s/%s".formatted(
                stripTrailing(minioConfig.getPublicUrl()),
                minioConfig.getBucket(),
                objectName);

        if (primary) {
            product.getImages().forEach(img -> img.setPrimary(false));
            product.setImageUrl(url);
            productRepository.save(product);
        }

        ProductImage image = productImageRepository.save(ProductImage.builder()
                .product(product)
                .url(url)
                .primary(primary)
                .displayOrder(product.getImages().size())
                .build());

        return new UploadImageResponse(image.getId(), image.getUrl(), image.isPrimary());
    }

    private String stripTrailing(String s) {
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
