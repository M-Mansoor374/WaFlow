export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "location"
  | "buttons"
  | "list"
  | "template"
  | "note"
  | "system";

export type DeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MediaAttachment {
  url: string;
  mimeType: string;
  filename?: string;
  size?: number;
  thumbnailUrl?: string;
  caption?: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "in" | "out";
  type: MessageType;
  body?: string;
  media?: MediaAttachment;
  location?: LocationPayload;
  status: DeliveryStatus;
  sender?: { id: string; name: string; avatarUrl?: string };
  isNote: boolean;
  mentions?: string[];
  createdAt: string;
}
