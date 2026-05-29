package com.cafeteria.api.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Getter
@Configuration
public class MinioConfig {

    @Value("${app.minio.url}")
    private String url;

    @Value("${app.minio.public-url}")
    private String publicUrl;

    @Value("${app.minio.access-key}")
    private String accessKey;

    @Value("${app.minio.secret-key}")
    private String secretKey;

    @Value("${app.minio.bucket}")
    private String bucket;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * Cria o bucket no startup. Não usa o @Bean minioClient() pra evitar
     * ciclo no PostConstruct — cria um cliente local só pra essa task.
     */
    @PostConstruct
    public void ensureBucket() {
        try {
            MinioClient bootstrap = MinioClient.builder()
                    .endpoint(url)
                    .credentials(accessKey, secretKey)
                    .build();

            boolean exists = bootstrap.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                bootstrap.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Bucket MinIO criado: {}", bucket);
            }

            String policy = """
                    {
                      "Version":"2012-10-17",
                      "Statement":[{
                        "Effect":"Allow",
                        "Principal":{"AWS":["*"]},
                        "Action":["s3:GetObject"],
                        "Resource":["arn:aws:s3:::%s/*"]
                      }]
                    }""".formatted(bucket);
            bootstrap.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
        } catch (Exception e) {
            log.warn("Nao foi possivel garantir bucket MinIO ({}): {}. " +
                    "Suba o docker compose do MinIO se for usar upload de imagens.",
                    bucket, e.getMessage());
        }
    }
}
