import { api } from '@/lib/axios';
import type { FavoriteResponse } from '@/types/api';

export const favoritesApi = {
  list: () => api.get<FavoriteResponse[]>('/favorites').then((r) => r.data),
  add: (productId: string) =>
    api.post<FavoriteResponse>(`/favorites/${productId}`).then((r) => r.data),
  remove: (productId: string) =>
    api.delete<void>(`/favorites/${productId}`).then(() => undefined),
};
