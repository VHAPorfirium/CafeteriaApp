import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const brl = (v: number | string): string => {
  const n = typeof v === 'string' ? Number(v) : v;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

export const formatDate = (iso: string, pattern = "dd 'de' MMM 'às' HH:mm"): string => {
  try {
    return format(parseISO(iso), pattern, { locale: ptBR });
  } catch {
    return iso;
  }
};

export const timeAgo = (iso: string): string => {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true });
  } catch {
    return iso;
  }
};

export const orderShortId = (id: string): string => id.slice(0, 8).toUpperCase();
