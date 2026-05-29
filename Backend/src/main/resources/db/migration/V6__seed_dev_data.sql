-- Usuários (senhas: Admin@123 e Cliente@123 — bcrypt strength 12)
INSERT INTO users (id, name, email, password_hash, role, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Administrador', 'admin@cafeteria.com',  '$2b$12$I3SF5vV1UyOhMJ3nm4Suae3kr8N.ZSEHmoFdciUqjbiFDT5AbEUUS', 'ADMIN', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Cliente Demo',  'cliente@cafeteria.com','$2b$12$cmSwtILXzds7j/XhE9R1/OP0JNR03E9gDVWTFIVc91MqLB8o6qjKS', 'USER',  TRUE);

-- Carrinho vazio do cliente
INSERT INTO carts (id, user_id) VALUES
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222');

-- Categorias
INSERT INTO categories (id, name, slug, description, display_order) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Cafés',            'cafes',            'Os melhores cafés especiais',           1),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Doces',            'doces',            'Bolos, tortas e doces artesanais',      2),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Salgados',         'salgados',         'Salgados quentinhos',                   3),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Bebidas Geladas',  'bebidas-geladas',  'Sucos, frappes e bebidas refrescantes', 4);

-- Produtos
INSERT INTO products (id, name, description, price, image_url, category_id, available, stock) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Espresso',           'Café espresso curto, encorpado',                                 6.50,  'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600', 'aaaaaaaa-0000-0000-0000-000000000001', TRUE, 100),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Cappuccino',         'Espresso + leite vaporizado + canela',                           9.50,  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600', 'aaaaaaaa-0000-0000-0000-000000000001', TRUE, 100),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Latte',              'Espresso + bastante leite vaporizado',                          10.00,  'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600',   'aaaaaaaa-0000-0000-0000-000000000001', TRUE, 100),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Mocha',              'Espresso, chocolate, leite vaporizado e chantilly',             12.00,  'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=600', 'aaaaaaaa-0000-0000-0000-000000000001', TRUE,  80),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Bolo de Cenoura',    'Fatia de bolo de cenoura com cobertura de chocolate',            8.50,  'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600', 'aaaaaaaa-0000-0000-0000-000000000002', TRUE,  40),
  ('bbbbbbbb-0000-0000-0000-000000000006', 'Brownie',            'Brownie de chocolate meio amargo',                               7.00,  'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600', 'aaaaaaaa-0000-0000-0000-000000000002', TRUE,  30),
  ('bbbbbbbb-0000-0000-0000-000000000007', 'Cheesecake',         'Cheesecake de frutas vermelhas',                                11.00,  'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=600', 'aaaaaaaa-0000-0000-0000-000000000002', TRUE,  25),
  ('bbbbbbbb-0000-0000-0000-000000000008', 'Coxinha',            'Coxinha de frango tradicional',                                  6.00,  'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600', 'aaaaaaaa-0000-0000-0000-000000000003', TRUE,  60),
  ('bbbbbbbb-0000-0000-0000-000000000009', 'Pão de Queijo',      'Pão de queijo mineiro quentinho (unidade)',                      3.50,  'https://images.unsplash.com/photo-1619189784900-3ed3ad5beed1?w=600', 'aaaaaaaa-0000-0000-0000-000000000003', TRUE, 200),
  ('bbbbbbbb-0000-0000-0000-00000000000a', 'Quiche Lorraine',    'Quiche tradicional francesa com bacon',                          14.00, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', 'aaaaaaaa-0000-0000-0000-000000000003', TRUE,  20),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'Suco de Laranja',    'Suco de laranja natural 300ml',                                  8.00,  'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600', 'aaaaaaaa-0000-0000-0000-000000000004', TRUE,  50),
  ('bbbbbbbb-0000-0000-0000-00000000000c', 'Frappuccino',        'Bebida gelada de café com creme batido',                        13.50,  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 'aaaaaaaa-0000-0000-0000-000000000004', TRUE,  40);

-- Imagens primárias
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, image_url, TRUE, 0 FROM products WHERE image_url IS NOT NULL;

-- Reviews iniciais
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000002', 5, 'Cappuccino perfeito, cremoso!'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000005', 4, 'Bolo gostoso, cobertura caprichada.');
