# Diagrama ER — Cafeteria

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "tem"
    USERS ||--|| CARTS : "possui"
    USERS ||--o{ ORDERS : "faz"
    USERS ||--o{ FAVORITES : "favorita"
    USERS ||--o{ REVIEWS : "avalia"
    USERS ||--o{ NOTIFICATIONS : "recebe"

    CATEGORIES ||--o{ PRODUCTS : "agrupa"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "tem"
    PRODUCTS ||--o{ CART_ITEMS : "está em"
    PRODUCTS ||--o{ ORDER_ITEMS : "compra"
    PRODUCTS ||--o{ FAVORITES : "é favorito"
    PRODUCTS ||--o{ REVIEWS : "recebe"

    CARTS ||--o{ CART_ITEMS : "contém"
    ORDERS ||--o{ ORDER_ITEMS : "contém"

    USERS {
        UUID id PK
        string name
        string email "unique"
        string password_hash
        enum role "USER|ADMIN"
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        UUID id PK
        UUID user_id FK
        string token_hash "unique, SHA-256"
        timestamp expires_at
        boolean revoked
        timestamp created_at
    }

    CATEGORIES {
        UUID id PK
        string name
        string slug "unique"
        text description
        boolean active
        int display_order
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        UUID id PK
        string name
        text description
        decimal price
        string image_url
        UUID category_id FK
        boolean available
        boolean active "soft delete"
        int stock
        bigint version "lock otimista"
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_IMAGES {
        UUID id PK
        UUID product_id FK
        string url
        boolean is_primary
        int display_order
    }

    CARTS {
        UUID id PK
        UUID user_id FK "unique"
    }

    CART_ITEMS {
        UUID id PK
        UUID cart_id FK
        UUID product_id FK
        int quantity
    }

    ORDERS {
        UUID id PK
        UUID user_id FK
        enum status "PENDING|PREPARING|READY|DELIVERED|CANCELLED"
        decimal total
        enum payment_method "PIX|CREDIT_CARD|DEBIT_CARD|CASH"
        string idempotency_key "unique nullable"
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        string product_name "snapshot"
        int quantity
        decimal unit_price
        decimal subtotal
        string notes
    }

    FAVORITES {
        UUID id PK
        UUID user_id FK
        UUID product_id FK
        timestamp created_at
    }

    REVIEWS {
        UUID id PK
        UUID user_id FK
        UUID product_id FK
        int rating "1..5"
        text comment
    }

    NOTIFICATIONS {
        UUID id PK
        UUID user_id FK
        enum type
        string title
        string message
        boolean read
        timestamp created_at
    }
```

## Notas de modelagem

- **PKs em UUID** para evitar enumeração e facilitar integração distribuída futura.
- **Soft delete em `products`** (campo `active`) para preservar histórico em `order_items`. Order items guardam `product_name` como snapshot — nome do produto na hora da compra não muda quando o admin edita depois.
- **Lock otimista** em `products.version`: dois pedidos concorrentes pro mesmo produto não corrompem o estoque.
- **Idempotência**: `orders.idempotency_key UNIQUE` (nullable). Frontend pode enviar header `Idempotency-Key` para evitar double-submit no checkout.
- **Refresh tokens versionados**: token_hash com SHA-256 do token opaco. Quando rotacionamos, o anterior é marcado `revoked=true`; tentativa de reuso revoga toda a árvore (proteção contra roubo).
- **Constraints UNIQUE compostas**: `(user_id, product_id)` em `favorites` e `reviews` garantem regras de domínio direto no banco.
