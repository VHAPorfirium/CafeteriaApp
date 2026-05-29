/**
 * Tela "Pedidos" do admin — kanban com 4 colunas (Pendentes / Preparando /
 * Prontos / Entregues) e área de cancelados.
 *
 * Tempo real: assina /topic/admin/orders via STOMP — novos pedidos
 * aparecem instantaneamente sem refetch manual.
 *
 * O botão de "próximo status" segue a máquina de estados do backend
 * (OrderStatus.canTransitionTo). Cancelamento é sempre permitido em
 * estados não-terminais.
 */
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/admin';
import { Icon } from '@/components/common/Icon';
import { Loader } from '@/components/common/Loader';
import { brl, formatDate, orderShortId } from '@/utils/format';
import { useSubscribe, useWebSocketConnection } from '@/hooks/useWebSocket';
import { getErrorMessage } from '@/lib/axios';
import type { OrderResponse, OrderStatus } from '@/types/api';

interface Column {
  key: OrderStatus;
  title: string;
  color: string;
  bg: string;
  next?: OrderStatus;
  nextLabel?: string;
}

const columns: Column[] = [
  { key: 'PENDING',    title: 'Pendentes',  color: '#8A6E2E',           bg: 'var(--c-warning-bg)',  next: 'PREPARING', nextLabel: 'Preparar' },
  { key: 'PREPARING',  title: 'Preparando', color: 'var(--c-primary)',  bg: 'var(--c-accent-soft)', next: 'READY',     nextLabel: 'Pronto' },
  { key: 'READY',      title: 'Prontos',    color: '#4A6A36',           bg: 'var(--c-success-bg)',  next: 'DELIVERED', nextLabel: 'Entregar' },
  { key: 'DELIVERED',  title: 'Entregues',  color: 'var(--c-muted)',    bg: 'var(--c-border)' },
];

export function AdminOrders() {
  const qc = useQueryClient();
  useWebSocketConnection();

  const ordersQ = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.listOrders(undefined, 0, 100),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Recebe novos pedidos em tempo real
  useSubscribe<OrderResponse>('/topic/admin/orders', (order) => {
    toast.success(`Novo pedido #${orderShortId(order.id)} de ${order.userName}`);
    qc.invalidateQueries({ queryKey: ['admin-orders'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  });

  const grouped: Record<OrderStatus, OrderResponse[]> = {
    PENDING: [], PREPARING: [], READY: [], DELIVERED: [], CANCELLED: [],
  };
  ordersQ.data?.content.forEach((o) => grouped[o.status]?.push(o));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>fluxo de pedidos</span>
          <h2 style={{ marginTop: 2, fontSize: 32 }}>Pedidos</h2>
          <p style={{ color: 'var(--c-muted)', marginTop: 4, fontSize: 14 }}>
            <Icon name="bell" size={14} color="var(--c-success)" /> Novos pedidos chegam aqui em tempo real
          </p>
        </div>
        <button
          type="button"
          className="cg-btn cg-btn-ghost"
          onClick={() => qc.invalidateQueries({ queryKey: ['admin-orders'] })}
        ><Icon name="refresh" size={16} /> Atualizar</button>
      </div>

      {ordersQ.isLoading && <Loader />}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24,
      }}>
        {columns.map((col) => (
          <section key={col.key} style={{
            background: col.bg, borderRadius: 14, padding: 12,
            minHeight: 480, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 8px 12px' }}>
              <h4 style={{ fontSize: 15, color: col.color }}>{col.title}</h4>
              <span style={{
                background: col.color, color: 'white', fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 999,
              }}>{grouped[col.key].length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
              {grouped[col.key].length === 0 && (
                <p style={{ color: 'var(--c-muted)', fontSize: 13, padding: 16, textAlign: 'center' }}>
                  Vazio.
                </p>
              )}
              {grouped[col.key].map((o) => (
                <article key={o.id} className="cg-card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: 14 }}>#{orderShortId(o.id)}</strong>
                    <span style={{
                      fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16,
                      color: 'var(--c-primary)',
                    }}>{brl(o.total)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-ink-soft)', marginTop: 2 }}>
                    {o.userName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-muted)', marginTop: 2 }}>
                    {formatDate(o.createdAt, "HH:mm 'de' dd/MM")} · {o.paymentMethod}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', fontSize: 12, color: 'var(--c-ink-soft)' }}>
                    {o.items.slice(0, 3).map((it) => (
                      <li key={it.id}>{it.quantity}× {it.productName}</li>
                    ))}
                    {o.items.length > 3 && <li>+ {o.items.length - 3} item(ns)</li>}
                  </ul>
                  {col.next && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button
                        type="button"
                        className="cg-btn cg-btn-primary cg-btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => updateStatus.mutate({ id: o.id, status: col.next! })}
                        disabled={updateStatus.isPending}
                      >
                        {col.nextLabel} <Icon name="chevR" size={12} />
                      </button>
                      <button
                        type="button"
                        className="cg-btn cg-btn-ghost cg-btn-sm"
                        onClick={() => updateStatus.mutate({ id: o.id, status: 'CANCELLED' })}
                        title="Cancelar pedido"
                      ><Icon name="close" size={14} /></button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {grouped.CANCELLED.length > 0 && (
        <section style={{ marginTop: 16, padding: 12, background: 'var(--c-danger-bg)', borderRadius: 14 }}>
          <h4 style={{ fontSize: 15, color: 'var(--c-danger)' }}>Cancelados ({grouped.CANCELLED.length})</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {grouped.CANCELLED.map((o) => (
              <span key={o.id} style={{
                fontSize: 12, padding: '6px 10px', background: 'var(--c-card)', borderRadius: 999,
                color: 'var(--c-ink-soft)',
              }}>#{orderShortId(o.id)} · {o.userName} · {brl(o.total)}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
