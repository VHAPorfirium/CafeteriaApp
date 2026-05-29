/**
 * Hook do carrinho. Centraliza o cartQuery e as mutations add/update/remove.
 *
 * Cada mutation, após sucesso, faz `setQueryData(['cart'], data)` para
 * atualizar a UI imediatamente, e em seguida `invalidateQueries` como dupla
 * garantia (qualquer subscriber que abrir depois recebe dados frescos).
 *
 * cartQuery só é ativado quando `isAuthenticated=true` para não disparar
 * 401 na home pública.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cartApi } from '@/api/cart';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/axios';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  });

  const addItem = useMutation({
    mutationFn: (variables: { productId: string; quantity: number }) =>
      cartApi.addItem(variables),
    onSuccess: (data) => {
      // Atualiza o cache imediatamente (UI responde sem esperar refetch)
      qc.setQueryData(['cart'], data);
      // E marca como stale pra qualquer subscriber que tenha aberto depois
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Adicionado ao carrinho');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Não foi possível adicionar')),
  });

  const updateItem = useMutation({
    mutationFn: (variables: { itemId: string; quantity: number }) =>
      cartApi.updateItem(variables.itemId, { quantity: variables.quantity }),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
    onError: (err) => toast.error(getErrorMessage(err, 'Falha ao atualizar item')),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (data) => {
      qc.setQueryData(['cart'], data);
      toast.success('Item removido');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Falha ao remover')),
  });

  return { cartQuery, addItem, updateItem, removeItem };
}
