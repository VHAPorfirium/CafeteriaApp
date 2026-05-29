import { api } from '@/lib/axios';
import type { CartResponse, CartItemRequest, UpdateCartItemRequest } from '@/types/api';

export const cartApi = {
  get: () => api.get<CartResponse>('/cart').then((r) => r.data),
  addItem: (data: CartItemRequest) =>
    api.post<CartResponse>('/cart/items', data).then((r) => r.data),
  updateItem: (itemId: string, data: UpdateCartItemRequest) =>
    api.patch<CartResponse>(`/cart/items/${itemId}`, data).then((r) => r.data),
  removeItem: (itemId: string) =>
    api.delete<CartResponse>(`/cart/items/${itemId}`).then((r) => r.data),
};
