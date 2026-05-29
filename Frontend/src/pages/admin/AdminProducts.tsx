import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/admin';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { Icon } from '@/components/common/Icon';
import { Photo } from '@/components/common/Photo';
import { Loader } from '@/components/common/Loader';
import { brl } from '@/utils/format';
import { getErrorMessage } from '@/lib/axios';
import type { ProductRequest, ProductResponse } from '@/types/api';

export function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const productsQ = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.list({ size: 100 }),
  });
  const categoriesQ = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductRequest>({
    defaultValues: { available: true, stock: 0, price: 0 },
  });

  const createMut = useMutation({
    mutationFn: (data: ProductRequest) => adminApi.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado');
      reset();
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRequest }) => adminApi.updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado');
      reset();
      setEditing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto removido');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const uploadMut = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      adminApi.uploadProductImage(id, file, true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Imagem enviada');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: ProductRequest) => {
    const payload: ProductRequest = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      available: Boolean(data.available),
    };
    if (editing) updateMut.mutate({ id: editing.id, data: payload });
    else createMut.mutate(payload);
  };

  const startEdit = (p: ProductResponse) => {
    setEditing(p);
    reset({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      categoryId: p.category.id,
      imageUrl: p.imageUrl ?? '',
      available: p.available,
      stock: p.stock,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    reset({ name: '', description: '', price: 0, categoryId: '', imageUrl: '', available: true, stock: 0 });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <span className="hand" style={{ fontSize: 22, color: 'var(--c-secondary)' }}>catálogo</span>
          <h2 style={{ marginTop: 2, fontSize: 32 }}>Produtos</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 24 }}>
        {/* Lista */}
        <section className="cg-card cg-card-pad">
          <h4 style={{ marginBottom: 12 }}>Cadastrados</h4>
          {productsQ.isLoading && <Loader />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 720, overflowY: 'auto' }}>
            {productsQ.data?.content.map((p) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 14, alignItems: 'center',
                padding: 10, border: '1px solid var(--c-border)', borderRadius: 10, background: 'var(--c-card)',
              }}>
                <div style={{ width: 64, height: 64 }}>
                  <Photo src={p.imageUrl} tag={p.name} tone="wood" radius={6} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                    {p.category.name} · {brl(p.price)} · estoque {p.stock}
                  </div>
                  {!p.available && (
                    <span className="cg-badge cg-badge-warn" style={{ marginTop: 4 }}>Indisponível</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMut.mutate({ id: p.id, file });
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="cg-btn cg-btn-ghost cg-btn-sm cg-btn-icon"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Enviar imagem"
                    title="Enviar imagem"
                  ><Icon name="upload" size={16} /></button>
                  <button
                    type="button"
                    className="cg-btn cg-btn-ghost cg-btn-sm cg-btn-icon"
                    onClick={() => startEdit(p)}
                    aria-label="Editar"
                  ><Icon name="edit" size={16} /></button>
                  <button
                    type="button"
                    className="cg-btn cg-btn-ghost cg-btn-sm cg-btn-icon"
                    onClick={() => {
                      if (confirm(`Remover "${p.name}"?`)) deleteMut.mutate(p.id);
                    }}
                    aria-label="Remover"
                    style={{ color: 'var(--c-danger)' }}
                  ><Icon name="trash" size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulário */}
        <section className="cg-card cg-card-pad" style={{ alignSelf: 'flex-start', position: 'sticky', top: 32 }}>
          <h3 style={{ marginTop: 2 }}>{editing ? 'Editar produto' : 'Novo produto'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <div className="cg-field">
              <label className="cg-label">Nome</label>
              <input
                className={`cg-input ${errors.name ? 'cg-error' : ''}`}
                {...register('name', { required: 'Obrigatório' })}
              />
              {errors.name && <span className="cg-help cg-error">{errors.name.message}</span>}
            </div>
            <div className="cg-field">
              <label className="cg-label">Descrição</label>
              <textarea className="cg-textarea" {...register('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="cg-field">
                <label className="cg-label">Preço (R$)</label>
                <input
                  className={`cg-input ${errors.price ? 'cg-error' : ''}`}
                  type="number" step="0.01" min="0"
                  {...register('price', { required: 'Obrigatório', valueAsNumber: true, min: 0 })}
                />
              </div>
              <div className="cg-field">
                <label className="cg-label">Estoque</label>
                <input
                  className="cg-input"
                  type="number" min="0"
                  {...register('stock', { valueAsNumber: true, min: 0 })}
                />
              </div>
            </div>
            <div className="cg-field">
              <label className="cg-label">Categoria</label>
              <select className="cg-select" {...register('categoryId', { required: 'Selecione' })}>
                <option value="">Selecione uma categoria</option>
                {categoriesQ.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="cg-field">
              <label className="cg-label">URL da imagem (opcional)</label>
              <input className="cg-input" {...register('imageUrl')} placeholder="https://..." />
              <span className="cg-help">Ou use o botão de upload na lista para enviar uma imagem ao MinIO.</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" {...register('available')} />
              <span style={{ fontSize: 14 }}>Disponível para venda</span>
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="submit"
                className="cg-btn cg-btn-primary"
                disabled={createMut.isPending || updateMut.isPending}
              >
                {editing ? 'Salvar' : 'Criar'}
              </button>
              {editing && (
                <button type="button" className="cg-btn cg-btn-ghost" onClick={cancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
