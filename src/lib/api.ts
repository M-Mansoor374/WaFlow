import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import type { ApiError } from "@/types/api";
import {
  getMockPaginatedConversations,
  getMockConversation,
  getMockMessages,
  getMockContact,
  getMockLabels,
  getMockAgents,
  updateMockConversation,
  appendMockMessage,
} from "@/lib/mock-data";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

const API_URL = import.meta.env.VITE_API_URL ?? "";

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null) {
  for (const { resolve, reject } of refreshQueue) {
    if (error || !token) {
      reject(error ?? new Error("Token refresh failed"));
    } else {
      resolve(token);
    }
  }
  refreshQueue = [];
}

async function refreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    await useAuthStore.getState().refreshAuth();
    const newToken = useAuthStore.getState().accessToken;

    if (!newToken) {
      const err = new Error("Session expired");
      processQueue(err, null);
      throw err;
    }

    processQueue(null, newToken);

    // Re-authenticate WebSocket with fresh token
    try {
      const { useWsStore } = await import("@/stores/ws.store");
      useWsStore.getState().reAuthenticate(newToken);
    } catch {
      // ws.store may not be loaded yet
    }

    return newToken;
  } catch (err) {
    processQueue(err instanceof Error ? err : new Error("Refresh failed"), null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_URL) return mockApiClient<T>(endpoint, options);

  const { accessToken } = useAuthStore.getState();
  const { tenantId } = useTenantStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (tenantId) {
    headers.set("X-Tenant-ID", tenantId);
  }
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshToken();
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } catch {
      useAuthStore.getState().logout();
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

/** Mock API when no backend is configured (demo/Loom). */
async function mockApiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const path = endpoint.replace(/\?.*$/, "");
  const params = endpoint.includes("?") ? new URLSearchParams(endpoint.slice(endpoint.indexOf("?") + 1)) : null;

  if (method === "GET" && path === "/conversations") {
    const page = Number(params?.get("page") ?? 1);
    const perPage = Number(params?.get("perPage") ?? 20);
    const status = params?.get("status");
    const assignedTo = params?.get("assignedTo");
    let data = getMockPaginatedConversations(1, 1000).data as Conversation[];
    const currentUserId = useAuthStore.getState().user?.id ?? "";
    if (status) {
      const statuses = status.split(",");
      data = data.filter((c) => statuses.includes(c.status));
    }
    if (assignedTo === "unassigned") data = data.filter((c) => !c.assignedTo);
    else if (assignedTo && assignedTo !== "unassigned") data = data.filter((c) => c.assignedTo?.id === assignedTo);
    const total = data.length;
    const start = (page - 1) * perPage;
    const pageData = data.slice(start, start + perPage);
    return {
      data: pageData,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    } as T;
  }

  const convIdMatch = method === "GET" && /^\/conversations\/([^/]+)$/.exec(path);
  if (convIdMatch) {
    const id = convIdMatch[1];
    if (id && path === `/conversations/${id}`) {
      const conv = getMockConversation(id);
      if (!conv) throw Object.assign(new Error("Not found"), { statusCode: 404 });
      return conv as T;
    }
  }

  const messagesMatch = /^\/conversations\/([^/]+)\/messages$/.exec(path);
  if (method === "GET" && messagesMatch) {
    return getMockMessages(messagesMatch[1]) as T;
  }

  if (method === "POST" && messagesMatch) {
    const convId = messagesMatch[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const user = useAuthStore.getState().user;
    const newMsg: Message = {
      id: `msg-${convId}-${Date.now()}`,
      conversationId: convId,
      direction: "out",
      type: (body.type as Message["type"]) || "text",
      body: body.body,
      media: body.media,
      location: body.location,
      status: "sent",
      sender: user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : undefined,
      isNote: false,
      createdAt: new Date().toISOString(),
    };
    appendMockMessage(convId, newMsg);
    return newMsg as T;
  }

  const contactMatch = method === "GET" && /^\/contacts\/([^/]+)$/.exec(path);
  if (contactMatch && !path.includes("/contacts/merge") && !path.endsWith("/tags")) {
    const id = contactMatch[1];
    if (!path.includes("/conversations")) {
      const contact = getMockContact(id);
      if (!contact) throw Object.assign(new Error("Not found"), { statusCode: 404 });
      return contact as T;
    }
  }

  const prevConvsMatch = /^\/contacts\/([^/]+)\/conversations$/.exec(path);
  if (method === "GET" && prevConvsMatch) {
    const contactId = prevConvsMatch[1];
    const convs = getMockPaginatedConversations(1, 50).data.filter((c: Conversation) => c.contactId === contactId);
    const withCount = convs.map((c: Conversation) => ({
      id: c.id,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: getMockMessages(c.id).length,
    }));
    return withCount as T;
  }

  // GET /search?q= — search conversations/messages (demo)
  if (method === "GET" && path === "/search") {
    const q = (params?.get("q") ?? "").toLowerCase().trim();
    if (!q) return [] as T;
    const convs = getMockPaginatedConversations(1, 100).data as Conversation[];
    const results: { conversationId: string; contactName: string; snippet: string; date: string }[] = [];
    for (const c of convs) {
      if (c.contactName.toLowerCase().includes(q) || c.contactPhone.includes(q)) {
        results.push({
          conversationId: c.id,
          contactName: c.contactName,
          snippet: c.lastMessage.body.slice(0, 80),
          date: c.lastMessage.timestamp.slice(0, 10),
        });
      }
      const msgs = getMockMessages(c.id);
      for (const m of msgs) {
        if (m.body?.toLowerCase().includes(q) && !results.some((r) => r.conversationId === c.id)) {
          results.push({
            conversationId: c.id,
            contactName: c.contactName,
            snippet: (m.body ?? "").slice(0, 80),
            date: m.createdAt.slice(0, 10),
          });
          break;
        }
      }
    }
    return results.slice(0, 20) as T;
  }

  // GET /whatsapp-numbers (demo)
  if (method === "GET" && path === "/whatsapp-numbers") {
    return [{ id: "wa-demo-1", label: "Main (Demo)" }] as T;
  }

  if (method === "GET" && path === "/labels") return getMockLabels() as T;
  if (method === "GET" && path === "/agents") return getMockAgents() as T;

  const statusMatch = method === "PATCH" && /^\/conversations\/([^/]+)\/status$/.exec(path);
  if (statusMatch) {
    const id = statusMatch[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    updateMockConversation(id, { status: body.status });
    return undefined as T;
  }

  const assignMatch = method === "POST" && /^\/conversations\/([^/]+)\/assign$/.exec(path);
  if (assignMatch) {
    const id = assignMatch[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const agentId = body.agentId ?? null;
    const agent = agentId ? getMockAgents()[0] ?? null : null;
    updateMockConversation(id, { assignedTo: agent });
    return undefined as T;
  }

  const addLabelMatch = method === "POST" && /^\/conversations\/([^/]+)\/labels$/.exec(path);
  if (addLabelMatch) {
    const id = addLabelMatch[1];
    const body = options.body ? JSON.parse(options.body as string) : {};
    const label = getMockLabels().find((l) => l.id === body.labelId);
    if (label) {
      const conv = getMockConversation(id);
      if (conv && !conv.labels.some((l) => l.id === label.id)) {
        updateMockConversation(id, { labels: [...conv.labels, label] });
      }
    }
    return undefined as T;
  }

  const removeLabelMatch = method === "DELETE" && /^\/conversations\/([^/]+)\/labels\/([^/]+)$/.exec(path);
  if (removeLabelMatch) {
    const [, id, labelId] = removeLabelMatch;
    const conv = getMockConversation(id!);
    if (conv) updateMockConversation(id!, { labels: conv.labels.filter((l) => l.id !== labelId) });
    return undefined as T;
  }

  if (method === "POST" && path === "/conversations/bulk") return undefined as T;

  const labelIdMatch = method === "GET" && /^\/labels\/([^/]+)$/.exec(path);
  if (labelIdMatch) {
    const label = getMockLabels().find((l) => l.id === labelIdMatch[1]);
    if (label) return label as T;
  }

  const agentIdMatch = method === "GET" && /^\/agents\/([^/]+)$/.exec(path);
  if (agentIdMatch) {
    const agent = getMockAgents().find((a) => a.id === agentIdMatch[1]);
    if (agent) return agent as T;
  }

  if (path === "/media/upload" && method === "POST") return { url: "https://picsum.photos/400" } as T;
  if (path.startsWith("/quick-replies")) return (path.endsWith("s") ? [] : undefined) as T;

  // Contact tags (demo: return empty)
  if (method === "GET" && /^\/contacts\/[^/]+\/tags$/.test(path)) return [] as T;
  if ((method === "POST" || method === "DELETE") && /^\/contacts\/[^/]+\/tags/.test(path)) return undefined as T;

  throw Object.assign(new Error("Not found"), { statusCode: 404 });
}
