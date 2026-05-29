import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi } from '@/api/products';
import { reviewsApi } from '@/api/reviews';
import { Photo } from '@/components/common/Photo';
import { Icon } from '@/components/common/Icon';
import { Stars } from '@/components/common/Stars';
import { Qty } from '@/components/common/Qty';
import { Loader } from '@/components/common/Loader';
import { brl, timeAgo } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getErrorMessage } from '@/lib/axios';

export function ProductDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCart();
  const { openCart } = useUIStore();
  const qc = useQueryClient();

  const productQ = useQuery({ queryKey: ['product', id], queryFn: () => productsApi.getById(id) });
  const reviewsQ = useQuery({ queryKey: ['product-reviews', id], queryFn: () => productsApi.reviews(id, 0, 20) });

  const submitReview = useMutation({
    mutationFn: () => reviewsApi.create({ productId: id, rating, comment: comment || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-reviews', id] });
      setComment(''); setRating(5);
      toast.success('Avaliação publicada!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (productQ.isLoading) return <Loader />;
  if (productQ.isError || !productQ.data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: 'var(--c-danger)' }}>Produto não encontrado.</p>
        <Link to="/" className="cg-btn cg-btn-secondary" style={{ marginTop: 16 }}>Voltar ao cardápio</Link>
      </div>
    );
  }

  const p = productQ.data;
  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar ao carrinho');
      navigate('/login');
      return;
    }
    addItem.mutate({ productId: p.id, quantity: qty }, { onSuccess: () => openCart() });
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px 64px' }}>
      <div style={{ fontSize: 13, color: 'var(--c-muted)', marginBottom: 16 }}>
        <Link to="/" style={{ color: 'inherit' }}>Cardápio</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span>{p.category.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48 }}>
        <div>
          <Photo src={p.imageUrl} tag={p.name} tone="wood" radius={20} style={{ height: 560 }} />
          {p.images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
              {p.images.slice(0, 4).map((img) => (
                <Photo key={img.id} src={img.url} tag={p.name} tone="light" radius={10} style={{ height: 88 }} />
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--c-muted)', letterSpacing: '.06em' }}>
            {p.category.name.toUpperCase()}
          </span>
          <h1 style={{ fontSize: 48, marginTop: 8, lineHeight: 1.05 }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Stars value={4.8} size={18} />
            <span style={{ color: 'var(--c-muted)', fontSize: 14 }}>
              {reviewsQ.data?.totalElements ?? 0} avaliações
            </span>
          </div>
          <p style={{ fontSize: 17, color: 'var(--c-ink-soft)', lineHeight: 1.55, marginTop: 24 }}>
            {p.description ?? 'Sem descrição.'}
          </p>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{
              fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 44,
              color: 'var(--c-primary)', lineHeight: 1,
            }}>{brl(p.price)}</span>
            <span style={{ color: 'var(--c-muted)', fontSize: 14 }}>
              · {p.available ? `${p.stock} em estoque` : 'esgotado'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
            <Qty value={qty} onMinus={() => setQty(Math.max(1, qty - 1))} onPlus={() => setQty(qty + 1)} />
            <button
              type="button"
              className="cg-btn cg-btn-primary cg-btn-lg"
              onClick={handleAdd}
              disabled={!p.available}
            >
              <Icon name="cart" size={18}/> Adicionar ao carrinho
            </button>
          </div>

          <div style={{
            marginTop: 32, padding: 20, background: 'var(--c-bg-warm)',
            border: '1px dashed var(--c-border-strong)', borderRadius: 12,
            display: 'flex', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--c-ink-soft)' }}>
              <Icon name="leaf" size={18} color="var(--c-success)" /> Ingredientes selecionados
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--c-ink-soft)' }}>
              <Icon name="clock" size={18} color="var(--c-secondary)" /> Pronto em ~15min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--c-ink-soft)' }}>
              <Icon name="sparkle" size={18} color="var(--c-accent)" /> Receita autoral
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section style={{ marginTop: 64 }}>
        <h2 style={{ marginBottom: 24 }}>Avaliações</h2>

        {isAuthenticated && (
          <div className="cg-card cg-card-pad" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Deixe sua avaliação</h4>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label={`${v} estrelas`}
                >
                  <Icon
                    name={v <= rating ? 'star-fill' : 'star'}
                    size={28}
                    color={v <= rating ? 'var(--c-accent)' : 'var(--c-border-strong)'}
                  />
                </button>
              ))}
            </div>
            <textarea
              className="cg-textarea"
              placeholder="Como foi sua experiência?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="button"
              className="cg-btn cg-btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => submitReview.mutate()}
              disabled={submitReview.isPending}
            >Publicar avaliação</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviewsQ.data?.content.length === 0 && (
            <p style={{ color: 'var(--c-muted)' }}>Seja o primeiro a avaliar este produto.</p>
          )}
          {reviewsQ.data?.content.map((r) => (
            <div key={r.id} className="cg-card cg-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong>{r.userName}</strong>
                  <Stars value={r.rating} size={14} />
                </div>
                <span style={{ color: 'var(--c-muted)', fontSize: 13 }}>{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && <p style={{ marginTop: 8, color: 'var(--c-ink-soft)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
