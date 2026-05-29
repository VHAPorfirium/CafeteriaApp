import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useUIStore } from '@/store/uiStore';

export function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartQuery } = useCart();
  const { openCart } = useUIStore();
  const navigate = useNavigate();

  const itemCount = cartQuery.data?.itemCount ?? 0;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(250,246,241,.92)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--c-border)',
    }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 48px', maxWidth: 1440, margin: '0 auto', gap: 32,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[
            { to: '/', label: 'Cardápio' },
            { to: '/meus-pedidos', label: 'Meus pedidos', auth: true },
            { to: '/favoritos', label: 'Favoritos', auth: true },
          ].filter((l) => !l.auth || isAuthenticated).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              style={({ isActive }) => ({
                color: isActive ? 'var(--c-primary)' : 'var(--c-ink-soft)',
                fontWeight: isActive ? 600 : 500, fontSize: 15,
                textDecoration: 'none', position: 'relative', padding: '4px 0',
                borderBottom: isActive ? '2px solid var(--c-primary)' : '2px solid transparent',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="cg-btn cg-btn-ghost cg-btn-icon"
            onClick={openCart}
            aria-label="Abrir carrinho"
            style={{ position: 'relative' }}
          >
            <Icon name="cart" />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18,
                padding: '0 5px', borderRadius: 9, background: 'var(--c-primary)',
                color: '#FFF8EE', fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{itemCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/perfil" className="cg-btn cg-btn-ghost" style={{ gap: 8 }}>
                <Icon name="user" /> <span>{user?.name.split(' ')[0]}</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="cg-btn cg-btn-secondary cg-btn-sm">
                  Admin
                </Link>
              )}
              <button type="button" className="cg-btn cg-btn-ghost cg-btn-icon" onClick={logout} aria-label="Sair">
                <Icon name="logout" />
              </button>
            </div>
          ) : (
            <button type="button" className="cg-btn cg-btn-primary" onClick={() => navigate('/login')}>
              Entrar
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
