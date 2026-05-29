import { api } from '@/lib/axios';
import type { CreateOrderRequest, OrderResponse, PageResponse } from '@/types/api';

export const ordersApi = {
  create: (data: CreateOrderRequest, idempotencyKey?: string) =>
    api
      .post<OrderResponse>('/orders', data, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
      })
      .then((r) => r.data),
  myOrders: (page = 0, size = 10) =>
    api
      .get<PageResponse<OrderResponse>>('/orders/me', { params: { page, size } })
      .then((r) => r.data),
  getById: (id: string) => api.get<OrderResponse>(`/orders/${id}`).then((r) => r.data),
};
