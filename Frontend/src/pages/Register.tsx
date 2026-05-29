import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Bean } from '@/components/common/Bean';
import { Icon } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types/api';

export function Register() {
  const { register: doRegister } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ position: 'relative' }}>
        <Photo tag="cadastro · café cremoso" tone="wood" radius={0} style={{ height: '100%' }} />
        <Bean size={64} style={{ position: 'absolute', top: 40, left: 40, transform: 'rotate(-20deg)', opacity: .85 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <Logo />
        </div>
        <span className="hand" style={{ fontSize: 24, color: 'var(--c-secondary)' }}>vem fazer parte</span>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, marginTop: 4 }}>Criar uma conta</h1>
        <p style={{ color: 'var(--c-ink-soft)', marginTop: 12, fontSize: 16 }}>
          Pedidos rápidos, favoritos salvos e novidades fresquinhas.
        </p>

        <form
          onSubmit={handleSubmit((data) => doRegister.mutate(data))}
          style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}
        >
          <div className="cg-field">
            <label className="cg-label">Nome</label>
            <input
              className={`cg-input ${errors.name ? 'cg-error' : ''}`}
              placeholder="Seu nome completo"
              {...register('name', { required: 'Informe seu nome', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
            />
            {errors.name && <span className="cg-help cg-error">{errors.name.message}</span>}
          </div>
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
              type="password" placeholder="Mínimo 8 caracteres"
              {...register('password', { required: 'Informe a senha', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            {errors.password && <span className="cg-help cg-error">{errors.password.message}</span>}
          </div>
          <button
            type="submit"
            className="cg-btn cg-btn-primary cg-btn-lg"
            disabled={doRegister.isPending}
          >
            {doRegister.isPending ? 'Criando...' : 'Criar conta'} <Icon name="chevR" />
          </button>
        </form>

        <p style={{ marginTop: 24, color: 'var(--c-ink-soft)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
