import { create } from "zustand";
import type { WsConnectionState, WsMessage } from "@/types/ws";
import { WaFlowSocket } from "@/lib/websocket";
import { useAuthStore } from "@/stores/auth.store";

interface WsState {
  connectionState: WsConnectionState;
  socket: WaFlowSocket | null;
  messageQueue: WsMessage[];

  connect: () => void;
  disconnect: () => void;
  reAuthenticate: (token: string) => void;
  send: (type: string, payload: unknown) => void;
}

export const useWsStore = create<WsState>((set, get) => ({
  connectionState: "disconnected",
  socket: null,
  messageQueue: [],

  connect: () => {
    const existing = get().socket;
    if (existing) {
      existing.destroy();
    }

    const wsUrl = import.meta.env.VITE_WS_URL ?? "";
    const token = useAuthStore.getState().accessToken;
    if (!token || !wsUrl) return;

    const socket = new WaFlowSocket(wsUrl, token, {
      onStateChange: (state) => set({ connectionState: state }),
      onMessage: (msg) => {
        set((s) => ({
          messageQueue: [...s.messageQueue, msg].slice(-500),
        }));
      },
    });

    set({ socket, connectionState: "connecting" });
    socket.connect();
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.destroy();
      set({ socket: null, connectionState: "disconnected" });
    }
  },

  reAuthenticate: (token: string) => {
    const { socket } = get();
    if (socket) {
      socket.reAuthenticate(token);
    }
  },

  send: (type: string, payload: unknown) => {
    const { socket } = get();
    if (socket) {
      socket.send(type, payload);
    }
  },
}));
