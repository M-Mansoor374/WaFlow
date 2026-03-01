import { useEffect, useCallback } from "react";
import { useWsStore } from "@/stores/ws.store";
import type { WsEventHandler } from "@/types/ws";

export function useWebSocket() {
  const connectionState = useWsStore((s) => s.connectionState);
  const socket = useWsStore((s) => s.socket);

  const subscribe = useCallback(
    <T = unknown>(event: string, handler: WsEventHandler<T>) => {
      if (!socket) return () => {};
      return socket.subscribe(event, handler);
    },
    [socket],
  );

  const send = useCallback(
    (type: string, payload: unknown) => {
      useWsStore.getState().send(type, payload);
    },
    [],
  );

  return { connectionState, subscribe, send };
}

export function useWsEvent<T = unknown>(
  event: string,
  handler: WsEventHandler<T>,
) {
  const socket = useWsStore((s) => s.socket);

  useEffect(() => {
    if (!socket) return;
    return socket.subscribe(event, handler);
  }, [socket, event, handler]);
}
