package com.cafeteria.api.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

    /**
     * Bucket compartilhado para o endpoint de login.
     * Mantém um {@link Bucket} por chave em memória — adequado pra uma
     * instância única; em produção com várias réplicas, migrar para
     * Redis ou Hazelcast.
     */
    @Component
    public static class LoginRateLimiter {

        @Value("${app.security.rate-limit.login-capacity}")
        private long capacity;

        @Value("${app.security.rate-limit.login-refill-minutes}")
        private long refillMinutes;

        private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

        public boolean tryConsume(String key) {
            return buckets.computeIfAbsent(key, k -> newBucket()).tryConsume(1);
        }

        private Bucket newBucket() {
            Bandwidth limit = Bandwidth.classic(capacity,
                    Refill.intervally(capacity, Duration.ofMinutes(refillMinutes)));
            return Bucket.builder().addLimit(limit).build();
        }
    }
}
