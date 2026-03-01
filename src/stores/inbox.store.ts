import { create } from "zustand";
import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types/api";
import type { Conversation, ConversationFilters, ConversationParticipant } from "@/types/conversation";
import type { Contact } from "@/types/contact";
import type { Message } from "@/types/message";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";

export type InboxTab = "all" | "mine" | "unassigned";
export type ConversationError = "not_found" | "forbidden" | "network" | null;

export interface LockInfo {
  agentId: string;
  agentName: string;
  lockedAt: string;
}

function matchesFilters(
  conv: Conversation,
  filters: ConversationFilters,
  tab: InboxTab,
  currentUserId: string,
): boolean {
  if (tab === "mine" && conv.assignedTo?.id !== currentUserId) return false;
  if (tab === "unassigned" && conv.assignedTo !== null) return false;
  if (filters.status?.length && !filters.status.includes(conv.status)) return false;
  if (filters.assignedTo === "unassigned" && conv.assignedTo !== null) return false;
  if (
    filters.assignedTo &&
    filters.assignedTo !== "unassigned" &&
    conv.assignedTo?.id !== filters.assignedTo
  )
    return false;
  if (
    filters.labelIds?.length &&
    !filters.labelIds.some((id) => conv.labels.some((l) => l.id === id))
  )
    return false;
  if (filters.whatsappNumberId && conv.whatsappNumberId !== filters.whatsappNumberId)
    return false;
  return true;
}

function dedupeConversations(conversations: Conversation[]): Conversation[] {
  const seen = new Set<string>();
  return conversations.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

const PER_PAGE = 20;

interface InboxState {
  conversations: Conversation[];
  totalCount: number;
  page: number;
  isLoadingList: boolean;
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoadingMessages: boolean;
  activeContact: Contact | null;
  filters: ConversationFilters;
  activeTab: InboxTab;
  selectedIds: string[];
  isBulkMode: boolean;
  typingAgents: Record<string, ConversationParticipant[]>;
  lockState: Record<string, LockInfo>;
  conversationError: ConversationError;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchOlderMessages: (conversationId: string) => Promise<void>;
  selectConversation: (id: string | null) => Promise<void>;
  sendMessage: (
    convId: string,
    payload: { type: string; body?: string; mediaUrl?: string; media?: unknown; location?: unknown },
  ) => Promise<void>;
  sendNote: (convId: string, body: string, mentions?: string[]) => Promise<void>;
  updateStatus: (convId: string, status: Conversation["status"]) => Promise<void>;
  addLabel: (convId: string, labelId: string) => Promise<void>;
  removeLabel: (convId: string, labelId: string) => Promise<void>;
  assignAgent: (convId: string, agentId: string | null) => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
  setFilters: (filters: ConversationFilters) => void;
  setActiveTab: (tab: InboxTab) => void;
  toggleBulkMode: () => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  dismissFailedMessage: (tempId: string) => void;
  clearConversationError: () => void;
  setActiveContact: (contact: Contact | null) => void;
  bulkAssign: (agentId: string | null) => Promise<void>;
  bulkUpdateStatus: (status: Conversation["status"]) => Promise<void>;
  bulkAddLabel: (labelId: string) => Promise<void>;
  bulkRemoveLabel: (labelId: string) => Promise<void>;

  handleMessageNew: (message: Message) => void;
  handleMessageStatus: (payload: { conversationId: string; messageId: string; status: Message["status"] }) => void;
  handleConversationUpdated: (conversation: Conversation) => void;
  handleAgentTyping: (payload: { conversationId: string; agent: ConversationParticipant; isTyping: boolean }) => void;
  handleConversationLock: (payload: { conversationId: string; agentId: string; agentName: string; lockedAt: string }) => void;
  handleConversationUnlock: (payload: { conversationId: string }) => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  conversations: [],
  totalCount: 0,
  page: 1,
  isLoadingList: false,
  activeConversationId: null,
  messages: {},
  isLoadingMessages: false,
  activeContact: null,
  filters: {},
  activeTab: "all",
  selectedIds: [],
  isBulkMode: false,
  typingAgents: {},
  lockState: {},
  conversationError: null,

  fetchConversations: async () => {
    set({ isLoadingList: true });
    const { page, filters, activeTab } = get();
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("perPage", String(PER_PAGE));
      if (filters.status?.length) params.set("status", filters.status.join(","));
      if (filters.labelIds?.length) params.set("labelIds", filters.labelIds.join(","));
      if (filters.assignedTo !== undefined) params.set("assignedTo", String(filters.assignedTo));
      if (filters.whatsappNumberId) params.set("whatsappNumberId", filters.whatsappNumberId);
      if (filters.search) params.set("search", filters.search);
      if (activeTab === "mine") {
        const userId = useAuthStore.getState().user?.id;
        if (userId) params.set("assignedTo", userId);
      } else if (activeTab === "unassigned") {
        params.set("assignedTo", "unassigned");
      }

      const res = await apiClient<PaginatedResponse<Conversation>>(
        `/conversations?${params.toString()}`,
      );
      const newConversations =
        page === 1 ? res.data : [...get().conversations, ...res.data];
      set({
        conversations: dedupeConversations(newConversations),
        totalCount: res.meta.total,
        isLoadingList: false,
      });
    } catch {
      set({ isLoadingList: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const data = await apiClient<Message[]>(
        `/conversations/${conversationId}/messages`,
      );
      set((state) => ({
        messages: { ...state.messages, [conversationId]: data },
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  fetchOlderMessages: async (conversationId) => {
    const list = get().messages[conversationId];
    if (!list?.length) return;
    const oldestId = list[0]?.id;
    if (!oldestId || oldestId.startsWith("temp_")) return;
    try {
      const data = await apiClient<Message[]>(
        `/conversations/${conversationId}/messages?before=${oldestId}&limit=50`,
      );
      if (data.length === 0) return;
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...data, ...(state.messages[conversationId] ?? [])],
        },
      }));
    } catch {
      // ignore
    }
  },

  selectConversation: async (id) => {
    if (!id) {
      set({
        activeConversationId: null,
        activeContact: null,
        conversationError: null,
      });
      return;
    }

    set({ conversationError: null, activeConversationId: id });
    const { conversations } = get();
    const inList = conversations.some((c) => c.id === id);

    if (!inList) {
      try {
        const conv = await apiClient<Conversation>(`/conversations/${id}`);
        set((state) => ({
          conversations: dedupeConversations([conv, ...state.conversations]),
        }));
      } catch (err: unknown) {
        const status = err && typeof err === "object" && "statusCode" in err ? (err as { statusCode: number }).statusCode : 500;
        const errorType: ConversationError =
          status === 404 ? "not_found" : status === 403 ? "forbidden" : "network";
        set({
          activeConversationId: null,
          activeContact: null,
          conversationError: errorType,
          isLoadingMessages: false,
        });
        return;
      }
    }

    get().fetchMessages(id);

    const conv = get().conversations.find((c) => c.id === id);
    if (conv) {
      try {
        const contact = await apiClient<Contact>(`/contacts/${conv.contactId}`);
        set({ activeContact: contact });
      } catch {
        set({ activeContact: null });
      }
    }
  },

  sendMessage: async (convId, payload) => {
    const tempId = `temp_${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
    const user = useAuthStore.getState().user;
    const optimistic: Message = {
      id: tempId,
      conversationId: convId,
      direction: "out",
      type: (payload.type as Message["type"]) || "text",
      body: payload.body,
      media: payload.media as Message["media"],
      location: payload.location as Message["location"],
      status: "sending",
      sender: user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : undefined,
      isNote: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: [...(state.messages[convId] ?? []), optimistic],
      },
    }));

    try {
      const created = await apiClient<Message>(`/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      set((state) => ({
        messages: {
          ...state.messages,
          [convId]: (state.messages[convId] ?? []).map((m) =>
            m.id === tempId ? { ...created, status: "sent" as const } : m,
          ),
        },
      }));
      const conv = get().conversations.find((c) => c.id === convId);
      if (conv) {
        const updated: Conversation = {
          ...conv,
          lastMessage: {
            body: payload.body ?? "",
            timestamp: created.createdAt,
            direction: "out",
          },
          updatedAt: created.createdAt,
        };
        set((state) => ({
          conversations: dedupeConversations([
            updated,
            ...state.conversations.filter((c) => c.id !== convId),
          ]),
        }));
      }
    } catch {
      set((state) => ({
        messages: {
          ...state.messages,
          [convId]: (state.messages[convId] ?? []).map((m) =>
            m.id === tempId ? { ...m, status: "failed" as const } : m,
          ),
        },
      }));
    }
  },

  sendNote: async (convId, body, mentions) => {
    try {
      const created = await apiClient<Message>(`/conversations/${convId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body, mentions: mentions ?? [] }),
      });
      set((state) => ({
        messages: {
          ...state.messages,
          [convId]: [...(state.messages[convId] ?? []), created],
        },
      }));
    } catch {
      // Error handled by API
    }
  },

  updateStatus: async (convId, status) => {
    try {
      await apiClient(`/conversations/${convId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, status } : c,
        ),
      }));
    } catch {
      // Error handled by API
    }
  },

  addLabel: async (convId, labelId) => {
    try {
      await apiClient(`/conversations/${convId}/labels`, {
        method: "POST",
        body: JSON.stringify({ labelId }),
      });
      const label = await apiClient<{ id: string; name: string; color: string }>(`/labels/${labelId}`);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, labels: [...c.labels, label] } : c,
        ),
      }));
    } catch {
      // Error handled by API
    }
  },

  removeLabel: async (convId, labelId) => {
    try {
      await apiClient(`/conversations/${convId}/labels/${labelId}`, {
        method: "DELETE",
      });
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, labels: c.labels.filter((l) => l.id !== labelId) } : c,
        ),
      }));
    } catch {
      // Error handled by API
    }
  },

  assignAgent: async (convId, agentId) => {
    try {
      await apiClient(`/conversations/${convId}/assign`, {
        method: "POST",
        body: JSON.stringify({ agentId }),
      });
      let assignedTo: ConversationParticipant | null = null;
      if (agentId) {
        const agent = await apiClient<ConversationParticipant>(`/agents/${agentId}`);
        assignedTo = agent;
      }
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, assignedTo } : c,
        ),
      }));
    } catch {
      // Error handled by API
    }
  },

  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient<{ url: string }>("/media/upload", {
      method: "POST",
      body: formData,
      headers: {},
    });
    if (!res.url) throw new Error("Upload failed");
    return res.url;
  },

  setFilters: (filters) => {
    set({ filters, page: 1 });
    get().fetchConversations();
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, page: 1 });
    get().fetchConversations();
  },

  toggleBulkMode: () =>
    set((state) => ({
      isBulkMode: !state.isBulkMode,
      selectedIds: state.isBulkMode ? [] : state.selectedIds,
    })),

  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),

  selectAll: () =>
    set((state) => ({
      selectedIds:
        state.selectedIds.length === state.conversations.length
          ? []
          : state.conversations.map((c) => c.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  dismissFailedMessage: (tempId) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;
    const list = messages[activeConversationId];
    if (!list) return;
    set((state) => ({
      messages: {
        ...state.messages,
        [activeConversationId]: list.filter((m) => m.id !== tempId),
      },
    }));
  },

  clearConversationError: () => set({ conversationError: null }),

  setActiveContact: (contact) => set({ activeContact: contact }),

  bulkAssign: async (agentId) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    try {
      await apiClient("/conversations/bulk", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, action: "assign", value: agentId }),
      });
      set({ selectedIds: [], isBulkMode: false });
      get().fetchConversations();
    } catch {
      // ignore
    }
  },

  bulkUpdateStatus: async (status) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    try {
      await apiClient("/conversations/bulk", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, action: "status", value: status }),
      });
      set({ selectedIds: [], isBulkMode: false });
      get().fetchConversations();
    } catch {
      // ignore
    }
  },

  bulkAddLabel: async (labelId) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    try {
      await apiClient("/conversations/bulk", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, action: "addLabel", value: labelId }),
      });
      get().fetchConversations();
    } catch {
      // ignore
    }
  },

  bulkRemoveLabel: async (labelId) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    try {
      await apiClient("/conversations/bulk", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, action: "removeLabel", value: labelId }),
      });
      get().fetchConversations();
    } catch {
      // ignore
    }
  },

  handleMessageNew: (message) => {
    const state = get();
    const currentUserId = useAuthStore.getState().user?.id ?? "";
    const convId = message.conversationId;

    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: [...(s.messages[convId] ?? []), message],
      },
    }));

    const conv = state.conversations.find((c) => c.id === convId);
    if (conv) {
      const updated: Conversation = {
        ...conv,
        lastMessage: {
          body: message.body ?? "",
          timestamp: message.createdAt,
          direction: message.direction,
        },
        unreadCount: message.direction === "in" ? conv.unreadCount + 1 : conv.unreadCount,
        updatedAt: message.createdAt,
      };

      if (matchesFilters(updated, state.filters, state.activeTab, currentUserId)) {
        set((s) => ({
          conversations: dedupeConversations([
            updated,
            ...s.conversations.filter((c) => c.id !== convId),
          ]),
        }));
      }
    }

    if (convId !== state.activeConversationId && message.direction === "in") {
      useNotificationStore.getState().addNotification({
        title: conv?.contactName ?? "New message",
        body: message.body ?? "",
        type: "message",
      });
    }
  },

  handleMessageStatus: (payload) => {
    set((state) => {
      const list = state.messages[payload.conversationId];
      if (!list) return state;
      return {
        messages: {
          ...state.messages,
          [payload.conversationId]: list.map((m) =>
            m.id === payload.messageId ? { ...m, status: payload.status } : m,
          ),
        },
      };
    });
  },

  handleConversationUpdated: (conversation) => {
    const state = get();
    const currentUserId = useAuthStore.getState().user?.id ?? "";
    const matches = matchesFilters(conversation, state.filters, state.activeTab, currentUserId);
    const inList = state.conversations.some((c) => c.id === conversation.id);

    if (matches && !inList) {
      set((s) => ({
        conversations: dedupeConversations([conversation, ...s.conversations]),
      }));
    } else if (!matches && inList) {
      set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== conversation.id),
      }));
    } else if (matches && inList) {
      set((s) => ({
        conversations: dedupeConversations([
          conversation,
          ...s.conversations.filter((c) => c.id !== conversation.id),
        ]),
      }));
    }
  },

  handleAgentTyping: (payload) => {
    const { conversationId, agent, isTyping } = payload;
    if (isTyping) {
      set((state) => {
        const current = state.typingAgents[conversationId] ?? [];
        const has = current.some((a) => a.id === agent.id);
        if (has) return state;
        return {
          typingAgents: {
            ...state.typingAgents,
            [conversationId]: [...current, agent],
          },
        };
      });
    } else {
      set((state) => {
        const current = state.typingAgents[conversationId] ?? [];
        const next = current.filter((a) => a.id !== agent.id);
        if (next.length === 0) {
          const { [conversationId]: _, ...rest } = state.typingAgents;
          return { typingAgents: rest };
        }
        return {
          typingAgents: { ...state.typingAgents, [conversationId]: next },
        };
      });
    }
  },

  handleConversationLock: (payload) => {
    set((state) => ({
      lockState: {
        ...state.lockState,
        [payload.conversationId]: {
          agentId: payload.agentId,
          agentName: payload.agentName,
          lockedAt: payload.lockedAt,
        },
      },
    }));
  },

  handleConversationUnlock: (payload) => {
    set((state) => {
      const { [payload.conversationId]: _, ...rest } = state.lockState;
      return { lockState: rest };
    });
  },
}));
