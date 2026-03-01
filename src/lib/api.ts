import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import type { ApiError } from "@/types/api";

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
  const { accessToken } = useAuthStore.getState();
  const { tenantId } = useTenantStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (tenantId) {
    headers.set("X-Tenant-ID", tenantId);
  }
  if (!headers.has("Content-Type") && options.body) {
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
