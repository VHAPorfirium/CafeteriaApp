/**
 * Hook de autenticação. Exposto para componentes:
 * - `login` / `register` (mutations React Query com toast + redirect)
 * - `logout` (revoga refresh no backend e limpa cache)
 * - `user` / `isAuthenticated` (lidos do Zustand)
 *
 * Pós-login bem-sucedido, redireciona para `/admin` se ADMIN ou `/` se USER.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { tokenStorage, getErrorMessage } from '@/lib/axios';
import type { LoginRequest, RegisterRequest } from '@/types/api';

export function useAuth() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAuthenticated, setSession, clear } = useAuthStore();

  const login = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      qc.invalidateQueries();
      toast.success(`Bem-vindo de volta, ${data.user.name}!`);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Falha no login')),
  });

  const register = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken, data.refreshToken);
      qc.invalidateQueries();
      toast.success('Conta criada com sucesso!');
      navigate('/');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Falha no cadastro')),
  });

  const logout = async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      /* noop */
    }
    clear();
    qc.clear();
    navigate('/login');
  };

  return { user, isAuthenticated, login, register, logout };
}
