/**
 * Componente raiz. Compõe os providers globais:
 *
 * - ErrorBoundary: captura erros de render e mostra tela amigável com stack.
 * - QueryClientProvider: cache global do TanStack Query.
 * - RouterProvider: react-router-dom v6.
 * - Toaster: notificações estilizadas no padrão do design.
 */
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#2B1D14',
              border: '1px solid #E8DFD3',
              boxShadow: '0 16px 40px rgba(111,78,55,.10), 0 4px 12px rgba(111,78,55,.06)',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            },
            success: { iconTheme: { primary: '#6B8E4E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#B5462E', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
