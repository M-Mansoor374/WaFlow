import type {
  WsConnectionState,
  WsMessage,
  WsEventHandler,
} from "@/types/ws";
import { useAuthStore } from "@/stores/auth.store";

const CLOSE_CODE_TOKEN_EXPIRED = 4401;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 25000;

interface WaFlowSocketOptions {
  onStateChange: (state: WsConnectionState) => void;
  onMessage: (msg: WsMessage) => void;
}

export class WaFlowSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private options: WaFlowSocketOptions;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;
  private eventHandlers = new Map<string, Set<WsEventHandler>>();

  constructor(url: string, token: string, options: WaFlowSocketOptions) {
    this.url = url;
    this.token = token;
    this.options = options;
  }

  connect() {
    if (this.destroyed) return;

    this.cleanup();
    this.options.onStateChange("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.options.onStateChange("authenticating");
      this.ws?.send(JSON.stringify({ type: "auth", token: this.token }));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);

        if (msg.type === "auth:success") {
          this.options.onStateChange("authenticated");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          return;
        }

        if (msg.type === "pong") return;

        this.options.onMessage(msg);

        const handlers = this.eventHandlers.get(msg.type);
        if (handlers) {
          for (const handler of handlers) {
            handler(msg.payload);
          }
        }
      } catch {
        // Malformed message
      }
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();

      if (this.destroyed) {
        this.options.onStateChange("disconnected");
        return;
      }

      if (event.code === CLOSE_CODE_TOKEN_EXPIRED) {
        this.handleTokenExpiredClose();
      } else {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose fires after onerror, reconnect handled there
    };
  }

  private async handleTokenExpiredClose() {
    this.options.onStateChange("reconnecting");

    try {
      await useAuthStore.getState().refreshAuth();
      const newToken = useAuthStore.getState().accessToken;

      if (!newToken) {
        this.options.onStateChange("disconnected");
        return;
      }

      this.token = newToken;
      this.connect();
    } catch {
      this.options.onStateChange("disconnected");
    }
  }

  private scheduleReconnect() {
    if (this.destroyed) return;

    this.options.onStateChange("reconnecting");
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      const { accessToken } = useAuthStore.getState();
      if (!accessToken) {
        this.options.onStateChange("disconnected");
        return;
      }
      this.token = accessToken;
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  reAuthenticate(newToken: string) {
    this.token = newToken;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "auth", token: newToken }));
    }
  }

  send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  subscribe<T = unknown>(event: string, handler: WsEventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler as WsEventHandler);

    return () => {
      handlers.delete(handler as WsEventHandler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  destroy() {
    this.destroyed = true;
    this.cleanup();
    this.eventHandlers.clear();
  }
}
