import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { Qty } from '@/components/common/Qty';
import { useCart } from '@/hooks/useCart';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { brl } from '@/utils/format';

export function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { cartQuery, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const cart = cartQuery.data;
  const hasItems = (cart?.items.length ?? 0) > 0;

  return (
    <>
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(43,29,20,.45)',
          zIndex: 50, backdropFilter: 'blur(2px)',
        }}
      />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, maxWidth: '100%',
        background: 'var(--c-card)', zIndex: 51,
        boxShadow: 'var(--sh-lg)', display: 'flex', flexDirection: 'column',
      }} className="cg">
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--c-border)',
        }}>
          <div>
            <h3 style={{ fontSize: 22 }}>Seu carrinho</h3>
            <p style={{ color: 'var(--c-muted)', fontSize: 13, marginTop: 2 }}>
              {cart?.itemCount ?? 0} {cart?.itemCount === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <button
            type="button"
            className="cg-btn cg-btn-ghost cg-btn-icon"
            onClick={closeCart}
            aria-label="Fechar"
          ><Icon name="close" /></button>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {!isAuthenticated && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Icon name="cart" size={40} color="var(--c-muted)" />
              <p style={{ marginTop: 16, color: 'var(--c-ink-soft)' }}>
                Faça login para usar o carrinho.
              </p>
              <button
                type="button"
                className="cg-btn cg-btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => { closeCart(); navigate('/login'); }}
              >Entrar</button>
            </div>
          )}

          {isAuthenticated && !hasItems && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Icon name="cart" size={40} color="var(--c-muted)" />
              <p style={{ marginTop: 16, color: 'var(--c-ink-soft)' }}>
                Seu carrinho está vazio.
              </p>
              <p className="hand" style={{ color: 'var(--c-secondary)', fontSize: 18, marginTop: 8 }}>
                que tal um café?
              </p>
            </div>
          )}

          {isAuthenticated && hasItems && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart!.items.map((it) => (
                <div key={it.id} style={{
                  display: 'flex', gap: 14, padding: 12,
                  border: '1px solid var(--c-border)', borderRadius: 12, background: 'var(--c-card)',
                }}>
                  <div style={{ width: 72, height: 72, flexShrink: 0 }}>
                    <Photo src={it.productImageUrl} tag={it.productName} tone="wood" radius={8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{it.productName}</div>
                    <div style={{ color: 'var(--c-muted)', fontSize: 12, marginTop: 2 }}>
                      {brl(it.unitPrice)} · un.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Qty
                        value={it.quantity}
                        sm
                        onMinus={() => updateItem.mutate({ itemId: it.id, quantity: Math.max(1, it.quantity - 1) })}
                        onPlus={() => updateItem.mutate({ itemId: it.id, quantity: it.quantity + 1 })}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(it.id)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--c-danger)', display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 500,
                        }}
                      ><Icon name="trash" size={14}/> Remover</button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-primary)', whiteSpace: 'nowrap' }}>
                    {brl(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && hasItems && (
          <footer style={{ padding: 24, borderTop: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, color: 'var(--c-ink-soft)' }}>Total</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 700, color: 'var(--c-primary)' }}>
                {brl(cart!.total)}
              </span>
            </div>
            <button
              type="button"
              className="cg-btn cg-btn-primary cg-btn-lg cg-btn-block"
              onClick={() => { closeCart(); navigate('/checkout'); }}
            >
              Finalizar pedido <Icon name="chevR" />
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
