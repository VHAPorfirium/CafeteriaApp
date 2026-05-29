/**
 * Cliente STOMP/SockJS singleton.
 *
 * - Conecta uma única vez por sessão; subscriptions são re-emitidas
 *   automaticamente após reconnect.
 * - Anexa o access token na query string do handshake (única forma
 *   suportada pelo browser para WS — não dá pra setar Authorization
 *   header na conexão inicial).
 * - O hook `useSubscribe` faz wrapper em React lifecycle.
 */
import { Client, type StompSubscription, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { tokenStorage } from './axios';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type Listener = (msg: IMessage) => void;

class WebSocketClient {
  private client: Client | null = null;
  private subscriptions = new Map<string, { sub: StompSubscription; listener: Listener }>();
  private pending: Array<{ destination: string; listener: Listener }> = [];
  private isConnected = false;

  connect() {
    if (this.client) return;
    const token = tokenStorage.getAccess();
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        this.isConnected = true;
        // re-aplica subs pendentes
        for (const { destination, listener } of this.pending) {
          this._subscribe(destination, listener);
        }
        this.pending = [];
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
      onStompError: (frame) => {
        console.warn('STOMP error', frame.headers, frame.body);
      },
    });
    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;
    this.subscriptions.forEach((s) => s.sub.unsubscribe());
    this.subscriptions.clear();
    this.client.deactivate();
    this.client = null;
    this.isConnected = false;
  }

  subscribe(destination: string, listener: Listener): () => void {
    if (!this.client) this.connect();
    if (this.isConnected && this.client) {
      this._subscribe(destination, listener);
    } else {
      this.pending.push({ destination, listener });
    }
    return () => this.unsubscribe(destination);
  }

  private _subscribe(destination: string, listener: Listener) {
    if (!this.client) return;
    const sub = this.client.subscribe(destination, listener);
    this.subscriptions.set(destination, { sub, listener });
  }

  unsubscribe(destination: string) {
    const entry = this.subscriptions.get(destination);
    if (entry) {
      entry.sub.unsubscribe();
      this.subscriptions.delete(destination);
    }
    this.pending = this.pending.filter((p) => p.destination !== destination);
  }
}

export const wsClient = new WebSocketClient();
