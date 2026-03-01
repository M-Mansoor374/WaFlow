export type WsConnectionState =
  | "connecting"
  | "connected"
  | "authenticating"
  | "authenticated"
  | "disconnected"
  | "reconnecting";

export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface WsAuthMessage {
  type: "auth";
  token: string;
}

export type WsEventHandler<T = unknown> = (payload: T) => void;
