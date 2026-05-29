import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { favoritesApi } from '@/api/favorites';
import { ProductCard } from '@/components/features/ProductCard';
import { Loader } from '@/components/common/Loader';
import { Icon } from '@/components/common/Icon';
import { useCart } from '@/hooks/useCart';
import { useUIStore } from '@/store/uiStore';
import { getErrorMessage } from '@/lib/axios';

export function Favorites() {
  const qc = useQueryClient();
  const { addItem } = useCart();
  const { openCart } = useUIStore();
  const favQ = useQuery({ queryKey: ['favorites'], queryFn: favoritesApi.list });

  const removeFav = useMutation({
    mutationFn: (productId: string) => favoritesApi.remove(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px 64px' }}>
      <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>guardados com carinho</span>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginTop: 4 }}>Favoritos</h1>

      {favQ.isLoading && <Loader />}

      {favQ.data?.length === 0 && (
        <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--c-muted)' }}>
          <Icon name="heart" size={40} />
          <p style={{ marginTop: 16 }}>Você ainda não favoritou nenhum produto.</p>
        </div>
      )}

      {favQ.data && favQ.data.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24, marginTop: 32,
        }}>
          {favQ.data.map((f) => (
            <ProductCard
              key={f.id}
              product={f.product}
              isFavorite
              onToggleFavorite={(id) => removeFav.mutate(id)}
              onAdd={(id) => addItem.mutate({ productId: id, quantity: 1 }, { onSuccess: () => openCart() })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
