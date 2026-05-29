import { api } from '@/lib/axios';
import type { ReviewRequest, ReviewResponse } from '@/types/api';

export const reviewsApi = {
  create: (data: ReviewRequest) =>
    api.post<ReviewResponse>('/reviews', data).then((r) => r.data),
};
