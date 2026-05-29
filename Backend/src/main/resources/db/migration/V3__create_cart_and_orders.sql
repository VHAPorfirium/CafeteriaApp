CREATE TABLE carts (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL UNIQUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID            NOT NULL,
    product_id      UUID            NOT NULL,
    quantity        INT             NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT chk_cartitem_qty CHECK (quantity > 0),
    CONSTRAINT uq_cartitem UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    total               DECIMAL(10,2)   NOT NULL,
    payment_method      VARCHAR(20)     NOT NULL,
    idempotency_key     VARCHAR(120),
    version             BIGINT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_order_status CHECK (status IN ('PENDING','PREPARING','READY','DELIVERED','CANCELLED')),
    CONSTRAINT chk_order_payment CHECK (payment_method IN ('PIX','CREDIT_CARD','DEBIT_CARD','CASH')),
    CONSTRAINT uq_order_idem UNIQUE (idempotency_key)
);

CREATE TABLE order_items (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID            NOT NULL,
    product_id      UUID            NOT NULL,
    product_name    VARCHAR(160)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10,2)   NOT NULL,
    subtotal        DECIMAL(10,2)   NOT NULL,
    notes           VARCHAR(500),
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT chk_orderitem_qty CHECK (quantity > 0)
);
