import { api } from '@/lib/axios';
import type { CategoryResponse } from '@/types/api';

export const categoriesApi = {
  list: () => api.get<CategoryResponse[]>('/categories').then((r) => r.data),
};
