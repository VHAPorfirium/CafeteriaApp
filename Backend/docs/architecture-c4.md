# Arquitetura — C4 Level 2 (Container)

```mermaid
flowchart TB
    user([Cliente / Admin<br/>navegador])

    subgraph internet[" "]
      direction TB
      frontend["<b>cafeteria-web</b><br/>React 18 + Vite<br/>Bootstrap 5 + TanStack Query<br/>:5173 (dev) / :80 (nginx)"]
    end

    subgraph backend_stack["docker compose · backend"]
      direction TB
      api["<b>cafeteria-api</b><br/>Spring Boot 3.3<br/>Java 21 · :8080<br/>REST + STOMP WebSocket"]
      pg[("PostgreSQL 16<br/>:5432<br/>volume pgdata")]
      minio[("MinIO<br/>:9000 / :9001<br/>bucket cafeteria-products")]
    end

    user -- "HTTPS · REST + WebSocket" --> frontend
    frontend -- "JSON / JWT Bearer<br/>HTTP REST" --> api
    frontend -- "STOMP / SockJS<br/>(token via query)" --> api
    api -- "JDBC<br/>Flyway migrations" --> pg
    api -- "S3 API<br/>upload imagens" --> minio
    frontend -- "GET imagens (público)" --> minio
```

## Containers

### cafeteria-web (frontend, repositório separado)
React 18 + Vite + TypeScript. Faz REST via Axios (interceptors anexam JWT, refresh automático em 401) e WebSocket via `@stomp/stompjs` + SockJS.

### cafeteria-api (este repositório)
Spring Boot 3.3:
- **Camada de apresentação**: REST controllers + STOMP controllers
- **Camada de aplicação**: services com regras de negócio, mappers MapStruct
- **Camada de domínio**: entities JPA + repositories Spring Data
- **Cross-cutting**: SecurityFilterChain com `JwtAuthFilter`, `GlobalExceptionHandler` (RFC 7807), `TraceIdFilter` (MDC), `Bucket4j` rate limit

### PostgreSQL 16
Schema versionado via Flyway (V1..V6). Tabelas com UUIDs, índices em colunas de filtro, locks otimistas em `products` e `orders`.

### MinIO
Storage S3-compatível para imagens. Bucket `cafeteria-products` com policy de download anônimo (URLs públicas servidas direto pra o navegador). `minio-init` cria o bucket no `docker compose up`.

## Fluxo de criação de pedido

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuário (web)
    participant API as cafeteria-api
    participant DB as PostgreSQL
    participant WS as STOMP Broker

    U->>API: POST /api/orders + Idempotency-Key
    API->>DB: SELECT cart + lock(product) FOR UPDATE OPTIMISTIC
    alt estoque < quantidade
        API-->>U: 422 Insufficient stock
    else estoque ok
        API->>DB: INSERT order + items, UPDATE products.stock, DELETE cart_items
        API->>WS: send /topic/admin/orders (novo pedido)
        API->>WS: send /user/{id}/queue/notifications
        API->>WS: send /topic/products/stock
        API-->>U: 201 Order
    end
```

## Fluxo de autenticação JWT com rotação de refresh token

```mermaid
sequenceDiagram
    participant U as Usuário
    participant API as cafeteria-api
    participant DB as PostgreSQL

    U->>API: POST /auth/login (email, password)
    API->>DB: SELECT user, bcrypt.matches?
    API->>API: gera access (15min) + refresh opaco (UUID)
    API->>DB: INSERT refresh_tokens (sha256(refresh), expires_at)
    API-->>U: { accessToken, refreshToken }

    Note over U,API: 15 minutos depois

    U->>API: POST /auth/refresh (refreshToken)
    API->>DB: SELECT by token_hash, ativo?
    API->>DB: UPDATE current SET revoked=true
    API->>API: gera novos tokens
    API->>DB: INSERT new refresh_tokens
    API-->>U: { accessToken, refreshToken }

    Note over U,API: tentativa de reuso (roubo)

    U->>API: POST /auth/refresh (refreshToken antigo)
    API->>DB: SELECT by token_hash → revoked
    API->>DB: UPDATE revokeAllForUser
    API-->>U: 401 Token invalido
```
