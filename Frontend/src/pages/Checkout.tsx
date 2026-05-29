/**
 * Tela de checkout. Resumo do carrinho + escolha de método de pagamento
 * + observações. Ao confirmar, gera um `Idempotency-Key` com
 * `crypto.randomUUID()` e envia no header — protege contra double-click
 * (mesmo se o request foi enviado duas vezes, o backend devolve o mesmo
 * pedido em vez de criar dois).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Icon, type IconName } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { useCart } from '@/hooks/useCart';
import { ordersApi } from '@/api/orders';
import { brl } from '@/utils/format';
import { getErrorMessage } from '@/lib/axios';
import type { PaymentMethod } from '@/types/api';

const methods: { id: PaymentMethod; label: string; icon: IconName }[] = [
  { id: 'PIX', label: 'PIX', icon: 'pix' },
  { id: 'CREDIT_CARD', label: 'Cartão de crédito', icon: 'card' },
  { id: 'DEBIT_CARD', label: 'Cartão de débito', icon: 'card' },
  { id: 'CASH', label: 'Dinheiro', icon: 'receipt' },
];

export function Checkout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { cartQuery } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState('');

  const placeOrder = useMutation({
    mutationFn: () => {
      const idemKey = crypto.randomUUID();
      return ordersApi.create({ paymentMethod: payment, notes: notes || undefined }, idemKey);
    },
    onSuccess: (order) => {
      toast.success('Pedido realizado! Em breve atualizamos o status.');
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      navigate(`/meus-pedidos?destacar=${order.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Não foi possível finalizar')),
  });

  const cart = cartQuery.data;
  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <Icon name="cart" size={48} color="var(--c-muted)" />
        <h2 style={{ marginTop: 16 }}>Seu carrinho está vazio</h2>
        <button type="button" className="cg-btn cg-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 48px 64px' }}>
      <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>quase lá</span>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginTop: 4 }}>Finalizar pedido</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, marginTop: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pagamento */}
          <section className="cg-card cg-card-pad">
            <h3>Pagamento</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayment(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    border: `2px solid ${payment === m.id ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    background: payment === m.id ? 'var(--c-bg-warm)' : 'var(--c-card)',
                    borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    color: 'var(--c-ink)', transition: 'all 150ms ease-out',
                  }}
                >
                  <Icon name={m.icon} size={22} color={payment === m.id ? 'var(--c-primary)' : 'var(--c-ink-soft)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                    {m.id === 'PIX' && <div style={{ fontSize: 12, color: 'var(--c-success)' }}>aprovação imediata</div>}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Observações */}
          <section className="cg-card cg-card-pad">
            <h3>Observações</h3>
            <textarea
              className="cg-textarea"
              placeholder="Sem açúcar, leite vegetal, ponto de retirada, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ marginTop: 12 }}
            />
          </section>
        </div>

        {/* Resumo */}
        <aside className="cg-card cg-card-pad" style={{ alignSelf: 'flex-start', position: 'sticky', top: 100 }}>
          <h3>Resumo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {cart.items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <Photo src={it.productImageUrl} tag={it.productName} tone="wood" radius={6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{it.productName}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{it.quantity} × {brl(it.unitPrice)}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{brl(it.subtotal)}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--c-border-strong)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 15, color: 'var(--c-ink-soft)' }}>Total</span>
            <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--c-primary)' }}>
              {brl(cart.total)}
            </span>
          </div>
          <button
            type="button"
            className="cg-btn cg-btn-accent cg-btn-lg cg-btn-block"
            style={{ marginTop: 16 }}
            onClick={() => placeOrder.mutate()}
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending ? 'Enviando...' : 'Confirmar pedido'} <Icon name="check" />
          </button>
        </aside>
      </div>
    </div>
  );
}
