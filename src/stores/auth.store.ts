import { create } from "zustand";
import type { User, LoginCredentials, AuthResponse } from "@/types/auth";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: User) => void;
  getTokenPayload: () => Record<string, unknown> | null;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.message ?? "Login failed");
    }

    const data: AuthResponse = await res.json();
    set({
      accessToken: data.accessToken,
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    const { accessToken } = get();
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
        credentials: "include",
      });
    } catch {
      // Best-effort server-side invalidation
    }
  },

  refreshAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        set({ accessToken: null, user: null, isAuthenticated: false });
        return;
      }

      const data: AuthResponse = await res.json();
      set({
        accessToken: data.accessToken,
        user: data.user,
        isAuthenticated: true,
      });
    } catch {
      set({ accessToken: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),

  getTokenPayload: () => {
    const { accessToken } = get();
    if (!accessToken) return null;
    try {
      return decodeJwtPayload(accessToken);
    } catch {
      return null;
    }
  },
}));
