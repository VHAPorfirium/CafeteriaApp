import { api } from '@/lib/axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }).then(() => undefined),
};
