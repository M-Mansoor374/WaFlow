export type ConversationStatus = "open" | "pending" | "resolved" | "snoozed";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactAvatarUrl?: string;
  assignedTo: ConversationParticipant | null;
  status: ConversationStatus;
  labels: Label[];
  lastMessage: { body: string; timestamp: string; direction: "in" | "out" };
  unreadCount: number;
  whatsappNumberId: string;
  snoozedUntil?: string;
  lockedBy?: ConversationParticipant;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationFilters {
  status?: ConversationStatus[];
  labelIds?: string[];
  assignedTo?: string | "unassigned";
  whatsappNumberId?: string;
  search?: string;
}
