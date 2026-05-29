import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bean } from '@/components/common/Bean';
import { Icon } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types/api';

export function Login() {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  useEffect(() => {
    if (params.get('expired')) toast.error('Sua sessão expirou, faça login novamente.');
  }, [params]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <Logo />
        </div>
        <span className="hand" style={{ fontSize: 24, color: 'var(--c-secondary)' }}>bom te ver de volta</span>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, marginTop: 4 }}>Entrar na conta</h1>
        <p style={{ color: 'var(--c-ink-soft)', marginTop: 12, fontSize: 16 }}>
          Acompanhe seus pedidos, favorite produtos e receba o café como você gosta.
        </p>

        <form
          onSubmit={handleSubmit((data) => login.mutate(data))}
          style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}
        >
          <div className="cg-field">
            <label className="cg-label">E-mail</label>
            <input
              className={`cg-input ${errors.email ? 'cg-error' : ''}`}
              type="email" placeholder="voce@cafegrao.com"
              {...register('email', { required: 'Informe o e-mail' })}
            />
            {errors.email && <span className="cg-help cg-error">{errors.email.message}</span>}
          </div>
          <div className="cg-field">
            <label className="cg-label">Senha</label>
            <input
              className={`cg-input ${errors.password ? 'cg-error' : ''}`}
              type="password" placeholder="••••••••"
              {...register('password', { required: 'Informe a senha' })}
            />
            {errors.password && <span className="cg-help cg-error">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            className="cg-btn cg-btn-primary cg-btn-lg"
            disabled={login.isPending}
          >
            {login.isPending ? 'Entrando...' : 'Entrar'} <Icon name="chevR" />
          </button>
        </form>

        <p style={{ marginTop: 24, color: 'var(--c-ink-soft)' }}>
          Não tem conta? <Link to="/registro" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Cadastre-se</Link>
        </p>

        <div style={{
          marginTop: 32, padding: 14, background: 'var(--c-bg-warm)',
          border: '1px dashed var(--c-border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--c-ink-soft)',
        }}>
          <strong>Demo:</strong> admin@cafeteria.com / Admin@123 — cliente@cafeteria.com / Cliente@123
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <Photo tag="login · grãos espalhados" tone="dark" radius={0} style={{ height: '100%' }} />
        <Bean size={64} style={{ position: 'absolute', top: 40, right: 40, opacity: .8 }} />
      </div>
    </div>
  );
}
