import { Link } from 'react-router-dom';
import type { ProductResponse } from '@/types/api';
import { Photo } from '@/components/common/Photo';
import { Icon } from '@/components/common/Icon';
import { Stars } from '@/components/common/Stars';
import { brl } from '@/utils/format';

interface ProductCardProps {
  product: ProductResponse;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onAdd?: (id: string) => void;
}

export function ProductCard({ product, isFavorite, onToggleFavorite, onAdd }: ProductCardProps) {
  return (
    <article className="cg-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Link to={`/produto/${product.id}`} style={{ position: 'relative', display: 'block' }}>
        <Photo
          src={product.imageUrl}
          tag={product.name}
          tone="wood"
          radius={0}
          style={{ height: 220 }}
        />
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onToggleFavorite(product.id); }}
            aria-label={isFavorite ? 'Desfavoritar' : 'Favoritar'}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,.92)', border: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isFavorite ? 'var(--c-danger)' : 'var(--c-ink-soft)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <Icon name={isFavorite ? 'heart-fill' : 'heart'} size={18} />
          </button>
        )}
        {!product.available && (
          <span className="cg-badge cg-badge-warn" style={{ position: 'absolute', top: 12, left: 12 }}>
            Esgotado
          </span>
        )}
      </Link>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--c-muted)', letterSpacing: '.04em' }}>
              {product.category.name.toUpperCase()}
            </span>
            <h4 style={{ fontSize: 17, marginTop: 2, lineHeight: 1.25 }}>
              <Link to={`/produto/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {product.name}
              </Link>
            </h4>
          </div>
        </div>
        {product.description && (
          <p style={{
            fontSize: 13, color: 'var(--c-ink-soft)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{product.description}</p>
        )}
        <Stars value={4.7} size={14} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
          <span style={{
            fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 700, color: 'var(--c-primary)',
          }}>{brl(product.price)}</span>
          <button
            type="button"
            className="cg-btn cg-btn-primary cg-btn-sm"
            onClick={() => onAdd?.(product.id)}
            disabled={!product.available}
          >
            <Icon name="plus" size={14}/> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}
