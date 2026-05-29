import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminApi } from '@/api/admin';
import { Icon, type IconName } from '@/components/common/Icon';
import { Loader } from '@/components/common/Loader';
import { brl } from '@/utils/format';

interface MetricProps {
  label: string;
  value: string;
  delta?: string;
  icon: IconName;
  accent?: string;
}

function Metric({ label, value, delta, icon, accent = 'var(--c-primary)' }: MetricProps) {
  return (
    <div className="cg-card cg-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: accent + '22',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: accent,
      }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ color: 'var(--c-muted)', fontSize: 13 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ fontSize: 12, color: 'var(--c-success)' }}>{delta}</div>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  PENDING: '#C9A66B',
  PREPARING: '#6F4E37',
  READY: '#6B8E4E',
  DELIVERED: '#8C7866',
  CANCELLED: '#B5462E',
};

export function AdminDashboard() {
  const statsQ = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.dashboardStats });

  if (statsQ.isLoading) return <Loader />;
  if (statsQ.isError || !statsQ.data) {
    return <p style={{ color: 'var(--c-danger)' }}>Falha ao carregar métricas.</p>;
  }

  const s = statsQ.data;
  const revenueChart = s.revenueLast7Days.map((r) => ({
    day: r.day.slice(5),
    revenue: Number(r.revenue),
  }));

  return (
    <div>
      <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>visão geral</span>
      <h2 style={{ marginTop: 2, fontSize: 32 }}>Dashboard</h2>
      <p style={{ color: 'var(--c-muted)', marginTop: 4 }}>Como anda a loja hoje, bem rapidinho.</p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        marginTop: 32,
      }}>
        <Metric label="Receita do mês" value={brl(s.totalRevenueMonth)} icon="card" accent="var(--c-primary)" />
        <Metric label="Receita últimos 7d" value={brl(s.totalRevenueLast7Days)} icon="chart" accent="var(--c-secondary)" />
        <Metric label="Total de pedidos" value={String(s.totalOrders)} icon="receipt" accent="var(--c-accent)" />
        <Metric label="Top produtos" value={String(s.topProducts.length)} icon="fire" accent="var(--c-danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginTop: 16 }}>
        <section className="cg-card cg-card-pad">
          <h4>Receita nos últimos 7 dias</h4>
          <div style={{ width: '100%', height: 280, marginTop: 16 }}>
            <ResponsiveContainer>
              <BarChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--c-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--c-muted)" tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(value: number) => brl(value)}
                  contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 8 }}
                />
                <Bar dataKey="revenue" fill="var(--c-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="cg-card cg-card-pad">
          <h4>Pedidos por status</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {s.ordersByStatus.length === 0 && (
              <p style={{ color: 'var(--c-muted)', fontSize: 13 }}>Sem dados.</p>
            )}
            {s.ordersByStatus.map((o) => {
              const max = Math.max(...s.ordersByStatus.map((x) => Number(x.count)));
              const width = (Number(o.count) / max) * 100;
              return (
                <div key={o.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--c-ink-soft)' }}>{o.status}</span>
                    <strong>{o.count}</strong>
                  </div>
                  <div style={{ height: 8, background: 'var(--c-bg-warm)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${width}%`, height: '100%', background: statusColors[o.status] || 'var(--c-primary)',
                      transition: 'width 320ms ease-out',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="cg-card cg-card-pad" style={{ marginTop: 16 }}>
        <h4>Mais vendidos</h4>
        <div style={{ marginTop: 16 }}>
          {s.topProducts.length === 0 && (
            <p style={{ color: 'var(--c-muted)', fontSize: 13 }}>Ainda sem dados.</p>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: 8, fontSize: 12, color: 'var(--c-muted)', fontWeight: 600 }}>Produto</th>
                <th style={{ padding: 8, fontSize: 12, color: 'var(--c-muted)', fontWeight: 600, textAlign: 'right' }}>Qtd</th>
                <th style={{ padding: 8, fontSize: 12, color: 'var(--c-muted)', fontWeight: 600, textAlign: 'right' }}>Receita</th>
              </tr>
            </thead>
            <tbody>
              {s.topProducts.map((p) => (
                <tr key={p.productId} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{p.productName}</td>
                  <td style={{ padding: 12, fontSize: 14, textAlign: 'right' }}>{p.quantity}</td>
                  <td style={{ padding: 12, fontSize: 14, textAlign: 'right', fontWeight: 600, color: 'var(--c-primary)' }}>
                    {brl(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
