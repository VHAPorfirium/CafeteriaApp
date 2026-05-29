import { api } from '@/lib/axios';
import type {
  CategoryRequest,
  CategoryResponse,
  DashboardStatsResponse,
  OrderResponse,
  OrderStatus,
  PageResponse,
  ProductRequest,
  ProductResponse,
  UploadImageResponse,
  UpdateOrderStatusRequest,
  UserResponse,
} from '@/types/api';

export const adminApi = {
  // Produtos
  createProduct: (data: ProductRequest) =>
    api.post<ProductResponse>('/admin/products', data).then((r) => r.data),
  updateProduct: (id: string, data: ProductRequest) =>
    api.put<ProductResponse>(`/admin/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id: string) =>
    api.delete<void>(`/admin/products/${id}`).then(() => undefined),
  uploadProductImage: (id: string, file: File, primary = false) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<UploadImageResponse>(`/admin/products/${id}/images?primary=${primary}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  // Categorias
  createCategory: (data: CategoryRequest) =>
    api.post<CategoryResponse>('/admin/categories', data).then((r) => r.data),
  updateCategory: (id: string, data: CategoryRequest) =>
    api.put<CategoryResponse>(`/admin/categories/${id}`, data).then((r) => r.data),

  // Pedidos
  listOrders: (status?: OrderStatus, page = 0, size = 50) =>
    api
      .get<PageResponse<OrderResponse>>('/admin/orders', { params: { status, page, size } })
      .then((r) => r.data),
  updateOrderStatus: (id: string, data: UpdateOrderStatusRequest) =>
    api.patch<OrderResponse>(`/admin/orders/${id}/status`, data).then((r) => r.data),

  // Dashboard
  dashboardStats: () =>
    api.get<DashboardStatsResponse>('/admin/dashboard/stats').then((r) => r.data),

  // Usuários
  listUsers: (page = 0, size = 20) =>
    api
      .get<PageResponse<UserResponse>>('/admin/users', { params: { page, size } })
      .then((r) => r.data),
};
