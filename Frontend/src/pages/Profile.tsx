import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { Bean } from '@/components/common/Bean';
import { useAuth } from '@/hooks/useAuth';
import { ordersApi } from '@/api/orders';
import { favoritesApi } from '@/api/favorites';
import { brl, formatDate, orderShortId } from '@/utils/format';

export function Profile() {
  const { user, logout } = useAuth();
  const ordersQ = useQuery({ queryKey: ['my-orders'], queryFn: () => ordersApi.myOrders(0, 5) });
  const favQ = useQuery({ queryKey: ['favorites'], queryFn: favoritesApi.list });

  if (!user) return null;

  const initials = user.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 48px 64px' }}>
      {/* Header */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
        padding: 32, background: 'var(--c-card)', borderRadius: 20,
        border: '1px solid var(--c-border)', boxShadow: 'var(--sh-sm)', position: 'relative', overflow: 'hidden',
      }}>
        <Bean size={140} style={{ position: 'absolute', right: -30, bottom: -40, opacity: .15, transform: 'rotate(20deg)' }} />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', zIndex: 1 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'var(--c-primary)', color: '#FFF8EE',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 36,
          }}>{initials}</div>
          <div>
            <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>olá,</span>
            <h1 style={{ fontSize: 40, lineHeight: 1.05, marginTop: 2 }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, color: 'var(--c-ink-soft)', fontSize: 14 }}>
              <span><Icon name="mail" size={14} /> {user.email}</span>
              {user.role === 'ADMIN' && (
                <span className="cg-badge cg-badge-warn">Administrador</span>
              )}
            </div>
          </div>
        </div>
        <button type="button" className="cg-btn cg-btn-secondary" onClick={logout}>
          <Icon name="logout" size={16} /> Sair da conta
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Pedidos recentes */}
        <section className="cg-card cg-card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3>Pedidos recentes</h3>
            <Link to="/meus-pedidos" style={{ color: 'var(--c-primary)', fontWeight: 600, fontSize: 14 }}>
              Ver todos →
            </Link>
          </div>
          {ordersQ.data?.content.length === 0 && (
            <p style={{ color: 'var(--c-muted)', padding: 16, textAlign: 'center' }}>
              Você ainda não fez nenhum pedido.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ordersQ.data?.content.map((o) => (
              <div key={o.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 14, background: 'var(--c-bg-warm)', borderRadius: 10,
              }}>
                <div>
                  <strong style={{ fontSize: 14 }}>#{orderShortId(o.id)}</strong>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{formatDate(o.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--c-primary)' }}>{brl(o.total)}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-muted)' }}>{o.items.length} itens</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Favoritos */}
        <section className="cg-card cg-card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3>Favoritos</h3>
            <Link to="/favoritos" style={{ color: 'var(--c-primary)', fontWeight: 600, fontSize: 14 }}>
              Ver todos →
            </Link>
          </div>
          {favQ.data?.length === 0 && (
            <p style={{ color: 'var(--c-muted)', padding: 16, textAlign: 'center' }}>
              Nada por aqui ainda.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favQ.data?.slice(0, 4).map((f) => (
              <Link
                key={f.id}
                to={`/produto/${f.product.id}`}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: 8,
                  borderRadius: 8, color: 'inherit', textDecoration: 'none',
                  transition: 'background 150ms ease-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-warm)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <Photo src={f.product.imageUrl} tag={f.product.name} tone="wood" radius={6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.product.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{brl(f.product.price)}</div>
                </div>
                <Icon name="heart-fill" size={16} color="var(--c-danger)" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
