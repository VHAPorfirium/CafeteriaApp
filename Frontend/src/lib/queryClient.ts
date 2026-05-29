/**
 * Configuração global do TanStack Query.
 *
 * - `staleTime: 30s` evita refetch ao re-montar componentes durante navegação.
 * - `refetchOnWindowFocus: false` — não recarrega só por voltar à aba.
 * - `retry: 1` em queries; mutations não retentam para não duplicar efeitos.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
