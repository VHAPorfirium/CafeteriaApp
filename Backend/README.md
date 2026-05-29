# Cafeteria API · Backend

Backend da aplicação fullstack de cafeteria — trabalho final de Desenvolvimento Web.

Stack: **Java 21 · Spring Boot 3.3 · PostgreSQL 16 · Flyway · JWT · WebSocket/STOMP · MinIO · Docker**.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Subir tudo com Docker](#subir-tudo-com-docker)
- [Rodar localmente (sem Docker)](#rodar-localmente-sem-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Credenciais de seed](#credenciais-de-seed)
- [Endpoints principais](#endpoints-principais)
- [WebSocket / STOMP](#websocket--stomp)
- [Testes e cobertura](#testes-e-cobertura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Decisões arquiteturais](#decisões-arquiteturais)

---

## Pré-requisitos

- Docker + Docker Compose (caminho recomendado)
- OU: JDK 21, Maven 3.9+, PostgreSQL 16 local

## Subir tudo com Docker

A partir da pasta `Backend/`:

```bash
cp .env.example .env
docker compose up --build
```

Sobe:

| Serviço      | Porta | URL                                |
|--------------|-------|------------------------------------|
| Backend API  | 8080  | http://localhost:8080              |
| Swagger UI   | 8080  | http://localhost:8080/swagger-ui.html |
| Healthcheck  | 8080  | http://localhost:8080/actuator/health |
| Postgres     | 5432  | jdbc:postgresql://localhost:5432/cafeteria |
| MinIO API    | 9000  | http://localhost:9000              |
| MinIO Console| 9001  | http://localhost:9001 (cafeteria / cafeteria123) |

Para subir também o pgAdmin (perfil opcional):

```bash
docker compose --profile tools up
# pgAdmin → http://localhost:5050  (admin@cafeteria.com / admin)
```

Derrubar tudo: `docker compose down -v` (o `-v` apaga os volumes — reset total).

## Rodar localmente (sem Docker)

1. Suba apenas Postgres e MinIO via Docker:
   ```bash
   docker compose up postgres minio minio-init
   ```
2. Rode a aplicação:
   ```bash
   mvn spring-boot:run
   ```

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Os principais:

| Variável            | Default                  | Descrição                          |
|---------------------|--------------------------|-------------------------------------|
| `DB_URL`            | `jdbc:postgresql://localhost:5432/cafeteria` | URL JDBC do Postgres |
| `DB_USER`           | `cafeteria`              | Usuário do banco                    |
| `DB_PASSWORD`       | `cafeteria`              | Senha do banco                      |
| `JWT_SECRET`        | (default de dev)         | Segredo HS256, mín. 256 bits        |
| `MINIO_URL`         | `http://localhost:9000`  | URL interna do MinIO                |
| `MINIO_PUBLIC_URL`  | `http://localhost:9000`  | URL pública para servir as imagens  |
| `MINIO_ACCESS_KEY`  | `cafeteria`              | Access key do MinIO                 |
| `MINIO_SECRET_KEY`  | `cafeteria123`           | Secret key do MinIO                 |
| `MINIO_BUCKET`      | `cafeteria-products`     | Bucket onde imagens são salvas      |

## Credenciais de seed

A migration `V6` popula o banco com usuários e produtos de demonstração:

| Tipo  | Email                    | Senha         |
|-------|--------------------------|---------------|
| Admin | admin@cafeteria.com      | `Admin@123`   |
| User  | cliente@cafeteria.com    | `Cliente@123` |

## Endpoints principais

> Documentação interativa completa: **http://localhost:8080/swagger-ui.html**

### Autenticação (público)
- `POST /api/auth/register` — registra usuário
- `POST /api/auth/login` — retorna access + refresh token
- `POST /api/auth/refresh` — rotaciona o refresh token
- `POST /api/auth/logout` — revoga o refresh token

### Catálogo (público)
- `GET /api/products?page=0&size=20&category=cafes&search=latte&sort=price,asc`
- `GET /api/products/{id}`
- `GET /api/products/{id}/reviews`
- `GET /api/categories`

### Área do usuário (Bearer token, role `USER`)
- `GET/POST/PATCH/DELETE /api/cart[/items[/{id}]]`
- `POST /api/orders` — cria pedido (aceita header opcional `Idempotency-Key`)
- `GET /api/orders/me`, `GET /api/orders/{id}`
- `GET/POST/DELETE /api/favorites[/{productId}]`
- `POST /api/reviews`

### Admin (Bearer token, role `ADMIN`)
- `POST/PUT/DELETE /api/admin/products`
- `POST /api/admin/products/{id}/images` — multipart, salva no MinIO
- `POST/PUT /api/admin/categories`
- `GET /api/admin/orders?status=PENDING`, `PATCH /api/admin/orders/{id}/status`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/users`

Todos os erros seguem o formato **RFC 7807 Problem Details**, com `traceId` e `timestamp` extras.

## WebSocket / STOMP

- Endpoint: `ws://localhost:8080/ws` (SockJS habilitado)
- Autenticação no handshake: `?token=<accessToken>` (ou header `Authorization`)
- Tópicos:
  - `/topic/admin/orders` — novos pedidos chegando (somente admin assina)
  - `/topic/products/stock` — broadcast de mudança de estoque
  - `/user/queue/order-updates` — pedido do usuário mudou de status
  - `/user/queue/notifications` — notificações privadas

Exemplo de uso com `@stomp/stompjs`:

```js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${accessToken}`),
  reconnectDelay: 5000,
});
client.onConnect = () => {
  client.subscribe('/user/queue/order-updates', (msg) => console.log(JSON.parse(msg.body)));
};
client.activate();
```

## Testes e cobertura

```bash
mvn verify
```

- Unitários: Mockito nos services
- Integração: Testcontainers (Postgres real) + MockMvc nos controllers
- Cobertura: JaCoCo report em `target/site/jacoco/index.html` (mínimo 70% nos packages `service` e `controller`)

## Estrutura do projeto

```
Backend/
├── docker-compose.yml         # Postgres + MinIO + backend (+ pgadmin via profile)
├── Dockerfile                  # multi-stage com Java 21
├── pom.xml
├── docs/
│   ├── er-diagram.md           # ER em Mermaid
│   ├── architecture-c4.md      # C4 container em Mermaid
│   └── Cafeteria.postman_collection.json
└── src/
    ├── main/java/com/cafeteria/api/
    │   ├── CafeteriaApiApplication.java
    │   ├── config/         # Security, WS, OpenAPI, MinIO, JPA Auditing, RateLimit
    │   ├── domain/         # entity, repository, enums
    │   ├── application/    # service, mapper, dto (request/response)
    │   ├── presentation/   # controller REST + websocket
    │   ├── security/       # JwtService, JwtAuthFilter, AuthenticatedUser
    │   └── exception/      # GlobalExceptionHandler + custom exceptions
    └── main/resources/
        ├── application.yml
        └── db/migration/   # V1..V6 Flyway
```

## Decisões arquiteturais

- **Clean Architecture leve**: pacotes domain / application / presentation com responsabilidades claras
- **JWT + refresh token com rotação**: access curto (15min) + refresh opaco (UUID hashado SHA-256) com tabela versionada. Tentativa de reuso revoga toda a sessão.
- **Flyway**: schema versionado de V1 a V6 (seed inclusive). Hibernate em `validate` — nunca cria nem altera tabelas.
- **MapStruct**: zero boilerplate Entity ↔ DTO, com `componentModel = spring`.
- **Bucket4j**: rate limit em `POST /auth/login` (5 tentativas/min por IP + email).
- **Idempotência em pedidos**: header `Idempotency-Key`. Mesma chave retorna o pedido criado anteriormente.
- **Lock otimista** no `Product` (`@Version`) — conflitos de estoque concorrentes geram 409.
- **Soft delete** em produtos (`active=false`) — pedidos antigos continuam consistentes.
- **MinIO**: storage S3-compatível para imagens de produto, bucket público para download (URLs diretas).
- **Problem Details RFC 7807**: respostas de erro padronizadas com `traceId` propagado via MDC.
- **Auditoria**: `@CreatedDate` / `@LastModifiedDate` herdados de `BaseAuditEntity`.

---

Documentos complementares: [ER diagram](docs/er-diagram.md) · [Arquitetura C4](docs/architecture-c4.md) · [Postman collection](docs/Cafeteria.postman_collection.json)
