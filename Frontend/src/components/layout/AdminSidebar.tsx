import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Icon, type IconName } from '@/components/common/Icon';
import { useAuth } from '@/hooks/useAuth';

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: 'box' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'receipt' },
];

export function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: 260, minHeight: '100vh', background: 'var(--c-dark)', color: 'var(--c-dark-ink)',
      display: 'flex', flexDirection: 'column', padding: '28px 20px',
      position: 'sticky', top: 0, alignSelf: 'flex-start',
    }}>
      <div style={{ marginBottom: 36 }}>
        <Logo dark />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 8,
              color: isActive ? 'var(--c-dark)' : 'var(--c-dark-ink)',
              background: isActive ? 'var(--c-accent)' : 'transparent',
              fontWeight: isActive ? 600 : 500, fontSize: 14,
              textDecoration: 'none', transition: 'all 150ms ease-out',
            })}
          >
            <Icon name={it.icon} size={18} />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{
        marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--c-dark-2)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--c-dark-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="user" size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-dark-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-accent)' }}>{user?.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', background: 'transparent',
            border: '1px solid var(--c-dark-2)', borderRadius: 8,
            color: 'var(--c-dark-ink)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          <Icon name="logout" size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}
