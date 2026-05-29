/**
 * Hooks de WebSocket:
 *
 * - `useWebSocketConnection()` — ativa a conexão STOMP quando o usuário
 *   está autenticado. Idempotente; chame nas páginas que precisam de WS.
 *
 * - `useSubscribe<T>(destination, handler)` — assina um destination STOMP
 *   durante o lifecycle do componente; faz JSON.parse automático e cancela
 *   no unmount.
 */
import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket';
import { useAuthStore } from '@/store/authStore';

export function useWebSocketConnection() {
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) wsClient.connect();
    return () => {
      // não desconecta no unmount — mantém ativo durante toda a sessão
    };
  }, [isAuthenticated]);
}

export function useSubscribe<T = unknown>(
  destination: string | null,
  handler: (payload: T) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    if (!destination) return;
    wsClient.connect();
    const unsubscribe = wsClient.subscribe(destination, (msg) => {
      try {
        const data = JSON.parse(msg.body) as T;
        handler(data);
      } catch {
        // body não-JSON, ignora
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, ...deps]);
}
