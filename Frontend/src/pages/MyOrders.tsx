import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ordersApi } from '@/api/orders';
import { Loader } from '@/components/common/Loader';
import { Icon } from '@/components/common/Icon';
import { brl, formatDate, orderShortId } from '@/utils/format';
import { useSubscribe, useWebSocketConnection } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import type { OrderResponse, OrderStatus } from '@/types/api';

const statusInfo: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente', color: '#8A6E2E', bg: 'var(--c-warning-bg)' },
  PREPARING: { label: 'Preparando', color: 'var(--c-primary)', bg: 'var(--c-accent-soft)' },
  READY: { label: 'Pronto', color: '#4A6A36', bg: 'var(--c-success-bg)' },
  DELIVERED: { label: 'Entregue', color: 'var(--c-muted)', bg: 'var(--c-border)' },
  CANCELLED: { label: 'Cancelado', color: 'var(--c-danger)', bg: 'var(--c-danger-bg)' },
};

export function MyOrders() {
  const [params] = useSearchParams();
  const highlight = params.get('destacar');
  const qc = useQueryClient();
  const { user } = useAuthStore();

  useWebSocketConnection();

  const ordersQ = useQuery({ queryKey: ['my-orders'], queryFn: () => ordersApi.myOrders(0, 20) });

  // Recebe atualizações em tempo real dos pedidos do usuário
  useSubscribe<OrderResponse>(
    user ? `/user/queue/order-updates` : null,
    (order) => {
      const info = statusInfo[order.status];
      toast.success(`Pedido #${orderShortId(order.id)} → ${info.label}`);
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  );

  useEffect(() => {
    if (highlight) {
      setTimeout(() => {
        document.getElementById(`order-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [highlight, ordersQ.data]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 48px 64px' }}>
      <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>seus pedidos</span>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginTop: 4 }}>Histórico</h1>

      {ordersQ.isLoading && <Loader />}

      {ordersQ.data?.content.length === 0 && (
        <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--c-muted)' }}>
          <Icon name="receipt" size={40} />
          <p style={{ marginTop: 16 }}>Você ainda não fez nenhum pedido.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {ordersQ.data?.content.map((o) => {
          const info = statusInfo[o.status];
          const isHighlight = highlight === o.id;
          return (
            <article
              key={o.id}
              id={`order-${o.id}`}
              className="cg-card cg-card-pad"
              style={{
                borderColor: isHighlight ? 'var(--c-primary)' : undefined,
                borderWidth: isHighlight ? 2 : 1,
                transition: 'border-color 300ms ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h4 style={{ fontSize: 17 }}>Pedido #{orderShortId(o.id)}</h4>
                    <span
                      className="cg-badge cg-badge-dot"
                      style={{ background: info.bg, color: info.color }}
                    >{info.label}</span>
                  </div>
                  <div style={{ color: 'var(--c-muted)', fontSize: 13, marginTop: 4 }}>
                    {formatDate(o.createdAt)} · {o.paymentMethod}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 24,
                    color: 'var(--c-primary)', lineHeight: 1,
                  }}>{brl(o.total)}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)', marginTop: 4 }}>
                    {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--c-border-strong)',
                display: 'flex', gap: 16, flexWrap: 'wrap',
              }}>
                {o.items.map((it) => (
                  <span key={it.id} style={{
                    fontSize: 13, padding: '6px 12px', background: 'var(--c-bg-warm)',
                    borderRadius: 999, color: 'var(--c-ink-soft)',
                  }}>{it.quantity}× {it.productName}</span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
