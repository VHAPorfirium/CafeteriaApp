import { api } from '@/lib/axios';
import type { PageResponse, ProductResponse, ReviewResponse } from '@/types/api';

export interface ProductListParams {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    api.get<PageResponse<ProductResponse>>('/products', { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ProductResponse>(`/products/${id}`).then((r) => r.data),
  reviews: (id: string, page = 0, size = 10) =>
    api
      .get<PageResponse<ReviewResponse>>(`/products/${id}/reviews`, { params: { page, size } })
      .then((r) => r.data),
};
