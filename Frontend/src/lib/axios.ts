/**
 * Cliente HTTP central do app.
 *
 * Recursos:
 * - Anexa Bearer token em toda request (request interceptor).
 * - Em 401 numa rota não-auth, tenta refresh transparente do access token
 *   e re-executa a request original. Múltiplas requests paralelas que
 *   batem em 401 ao mesmo tempo são enfileiradas para evitar N refreshes.
 * - Se o refresh também falhar, limpa o storage e redireciona para
 *   /login?expired=1.
 *
 * Tokens são guardados em localStorage para sobreviver a reload.
 */
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { AuthResponse, ProblemDetails } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// === Token storage helpers ===
const ACCESS_KEY = 'cg.accessToken';
const REFRESH_KEY = 'cg.refreshToken';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// === Request interceptor: anexa Bearer ===
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Refresh handling com fila para evitar múltiplos refresh paralelos ===
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onRefreshed(newToken: string) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post<AuthResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken: refresh },
      { headers: { 'Content-Type': 'application/json' } },
    );
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } else {
        // sessão expirou: redireciona pra login
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  },
);

// Helper para extrair mensagem de erro do Problem Details
export function getErrorMessage(err: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError<ProblemDetails>(err)) {
    const pd = err.response?.data;
    if (pd?.errors && pd.errors.length > 0) {
      return pd.errors.map((e) => `${e.field}: ${e.message}`).join(' · ');
    }
    return pd?.detail || pd?.title || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
