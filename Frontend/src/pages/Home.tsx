/**
 * Home / Cardápio público.
 *
 * Estrutura (fielmente reproduzida do design Café & Grão):
 * - Hero com hand-script, headline grande e foto decorada
 * - Chips de categorias (carregadas via /api/categories)
 * - Grid de produtos paginado (via /api/products)
 * - Favoritar e adicionar ao carrinho requerem login
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { favoritesApi } from '@/api/favorites';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useCart';
import { useUIStore } from '@/store/uiStore';
import { ProductCard } from '@/components/features/ProductCard';
import { Photo } from '@/components/common/Photo';
import { Bean } from '@/components/common/Bean';
import { Icon } from '@/components/common/Icon';
import { Loader } from '@/components/common/Loader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/axios';

export function Home() {
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCart();
  const { openCart } = useUIStore();
  const qc = useQueryClient();

  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const productsQ = useQuery({
    queryKey: ['products', categorySlug, search],
    queryFn: () => productsApi.list({ category: categorySlug, search: search || undefined, size: 24 }),
  });
  const favoritesQ = useQuery({
    queryKey: ['favorites'], queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  });

  const favoriteIds = new Set(favoritesQ.data?.map((f) => f.product.id) ?? []);

  const toggleFav = useMutation({
    mutationFn: async (productId: string) => {
      if (favoriteIds.has(productId)) {
        await favoritesApi.remove(productId);
      } else {
        await favoritesApi.add(productId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleAdd = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }
    addItem.mutate({ productId, quantity: 1 }, { onSuccess: () => openCart() });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      {/* Hero */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48,
        alignItems: 'center', padding: '56px 48px 32px',
      }}>
        <div>
          <span className="hand" style={{ fontSize: 28, color: 'var(--c-secondary)' }}>
            aqui o café é feito devagar
          </span>
          <h1 style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: '-0.025em', marginTop: 12 }}>
            Da fazenda<br/>até a sua{' '}
            <em style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--c-primary)' }}>
              xícara.
            </em>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--c-ink-soft)', marginTop: 20, maxWidth: 480, lineHeight: 1.55 }}>
            Grãos selecionados, torra própria e fornada do dia. Um lugar para desacelerar no meio da semana.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
            <a href="#cardapio" className="cg-btn cg-btn-primary cg-btn-lg">
              <Icon name="coffee" size={18} /> Ver cardápio
            </a>
          </div>
          <div style={{
            display: 'flex', gap: 28, marginTop: 36, paddingTop: 28,
            borderTop: '1px dashed var(--c-border-strong)',
          }}>
            {[['12','tipos de grão'],['48','itens na fornada'],['4.9','★ no Google']].map(([n, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 34,
                  color: 'var(--c-primary)', lineHeight: 1,
                }}>{n}</div>
                <div style={{ color: 'var(--c-muted)', fontSize: 13, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Photo tag="hero · barista preparando v60" tone="dark" radius={20} style={{ height: 520, boxShadow: 'var(--sh-lg)' }} />
          <div style={{
            position: 'absolute', bottom: -24, left: -24,
            background: '#FFF8EE', padding: '16px 20px', borderRadius: 14,
            boxShadow: 'var(--sh-lg)', border: '1px solid var(--c-border)', transform: 'rotate(-3deg)',
          }}>
            <div className="hand" style={{ fontSize: 22, color: 'var(--c-primary)' }}>especial da semana</div>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 17, marginTop: 2 }}>
              Bourbon Amarelo · Cerrado
            </div>
          </div>
          <Bean size={48} style={{ position: 'absolute', top: -16, right: 20, transform: 'rotate(20deg)', opacity: .85 }} />
        </div>
      </section>

      {/* Search + filtros */}
      <section id="cardapio" style={{ padding: '24px 48px 8px' }}>
        <form onSubmit={submitSearch} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 360px', maxWidth: 480 }}>
            <Icon name="search" size={18} color="var(--c-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="cg-input"
              placeholder="Buscar um café, um doce, um pão..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`cg-chip ${categorySlug === undefined ? 'cg-chip-active' : ''}`}
              onClick={() => setCategorySlug(undefined)}
            >Todos</button>
            {categoriesQ.data?.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cg-chip ${categorySlug === c.slug ? 'cg-chip-active' : ''}`}
                onClick={() => setCategorySlug(c.slug)}
              >{c.name}</button>
            ))}
          </div>
        </form>
      </section>

      {/* Grid de produtos */}
      <section style={{ padding: '24px 48px 64px' }}>
        {productsQ.isLoading ? <Loader label="Carregando o cardápio..." /> : null}
        {productsQ.isError ? (
          <p style={{ color: 'var(--c-danger)' }}>Falha ao carregar produtos.</p>
        ) : null}
        {productsQ.data && (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 20,
            }}>
              <h2>Cardápio</h2>
              <span style={{ color: 'var(--c-muted)', fontSize: 14 }}>
                {productsQ.data.totalElements} itens
              </span>
            </div>
            {productsQ.data.content.length === 0 ? (
              <p style={{ color: 'var(--c-muted)', padding: 32, textAlign: 'center' }}>
                Nenhum produto encontrado.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}>
                {productsQ.data.content.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFavorite={favoriteIds.has(p.id)}
                    onToggleFavorite={isAuthenticated ? (id) => toggleFav.mutate(id) : undefined}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
