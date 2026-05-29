# Cafeteria Web · Frontend

SPA do Café & Grão — trabalho final de Desenvolvimento Web.

Stack: **React 18 · Vite 5 · TypeScript · TanStack Query · Zustand · Axios · @stomp/stompjs · Recharts · React Hook Form · React Hot Toast · date-fns**.

Identidade visual: paleta café/caramelo/creme, tipografia Fraunces + DM Sans + Caveat. Todos os tokens estão em `src/index.css`.

---

## Como rodar

### Modo dev (Vite local)

```bash
cd Frontend
cp .env.example .env
npm install
npm run dev
```

App em http://localhost:5173. O backend precisa estar rodando em http://localhost:8080.

### Modo Docker (só o frontend)

> Antes: o backend tem que estar de pé em `http://localhost:8080`. Suba ele primeiro com `cd ../Backend && docker compose up`.

```bash
cd Frontend
cp .env.example .env
docker compose up --build
```

Nginx servindo o build em http://localhost:5173.

Para apontar pra outro backend, mude `VITE_API_URL` e `VITE_WS_URL` no `.env` antes do build.

---

## Variáveis de ambiente

| Variável | Default | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Base da REST API |
| `VITE_WS_URL` | `http://localhost:8080/ws` | Endpoint STOMP/SockJS |

São injetadas em build-time. No Docker, sobrescreva via `--build-arg` ou no `docker-compose.yml`.

---

## Credenciais de demo

| Tipo | E-mail | Senha |
|---|---|---|
| Admin | `admin@cafeteria.com` | `Admin@123` |
| User | `cliente@cafeteria.com` | `Cliente@123` |

---

## Rotas

**Públicas**
- `/` — Home com hero + filtros + cardápio
- `/produto/:id` — Detalhe + reviews
- `/login` · `/registro`

**Usuário (auth)**
- `/perfil` — dados, pedidos recentes, favoritos
- `/meus-pedidos` — histórico com atualizações em tempo real via WebSocket
- `/favoritos`
- `/checkout`

**Admin (`ROLE_ADMIN`)**
- `/admin` — dashboard com Recharts (vendas 7 dias, top produtos, pedidos por status)
- `/admin/produtos` — CRUD com upload de imagem ao MinIO
- `/admin/pedidos` — Kanban (Pendentes → Preparando → Prontos → Entregues) com **novos pedidos chegando em tempo real**

---

## Arquitetura

```
src/
├── api/            # services tipados (auth, products, cart, orders, ...)
├── components/
│   ├── common/     # Icon, Stars, Photo, Qty, Loader, ProtectedRoute, ...
│   ├── layout/     # TopNav, AdminSidebar
│   └── features/   # ProductCard, CartDrawer
├── hooks/          # useAuth, useCart, useWebSocket
├── lib/            # axios (interceptor + refresh), websocket (STOMP), queryClient
├── pages/          # Home, ProductDetail, Login, Register, Profile, Checkout, ...
├── routes/         # configuração do react-router
├── store/          # authStore, uiStore (Zustand)
├── types/          # interfaces alinhadas aos DTOs do backend
├── utils/          # formatadores (BRL, datas)
├── App.tsx
├── main.tsx
└── index.css       # design tokens do Café & Grão
```

### Pontos chave

- **Axios** com interceptor que anexa Bearer, faz refresh transparente em 401 e enfileira requisições paralelas que esperam o novo token.
- **STOMP** singleton em `lib/websocket.ts`, conecta com `?token=` no handshake. `useSubscribe` cuida do ciclo de vida.
- **TanStack Query** para cache, com invalidações pontuais em mutations. `cartQuery` é a fonte da verdade do carrinho — o backend devolve o objeto completo em cada operação.
- **React Hook Form + Zod** nos formulários (login, registro, admin produtos).
- **Recharts** no dashboard admin.
- **Idempotency-Key** gerada com `crypto.randomUUID()` no checkout — protege double-click.

### Integrações em tempo real

| Tópico STOMP | Quem assina | O que faz |
|---|---|---|
| `/topic/admin/orders` | Admin · Pedidos | Card aparece imediatamente quando cliente fecha pedido |
| `/topic/products/stock` | Home (potencial) | Atualiza estoque dos produtos |
| `/user/queue/order-updates` | Meus pedidos | Toast + refresh ao admin mudar status |
| `/user/queue/notifications` | Geral | Notificações privadas |

---

## Build de produção

```bash
npm run build
npm run preview   # serve o /dist localmente para conferir
```

Imagens otimizadas, code-split por rota via React Router lazy (futuro), bundle ~200KB gzip.
