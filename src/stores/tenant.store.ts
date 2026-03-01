import { create } from "zustand";
import type { Tenant } from "@/types/tenant";

interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  domain: string | null;
  isResolved: boolean;
  hostnameCheckComplete: boolean;

  resolveBySlug: (slug: string) => Promise<void>;
  resolveByHostname: (hostname: string) => Promise<void>;
  applyTheme: () => void;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

function setTenantFromResponse(
  set: (partial: Partial<TenantState>) => void,
  tenant: Tenant,
) {
  set({
    tenantId: tenant.id,
    tenantName: tenant.name,
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    logoUrl: tenant.logoUrl ?? null,
    domain: tenant.domain ?? null,
    isResolved: true,
  });
}

export const useTenantStore = create<TenantState>((set, get) => ({
  tenantId: null,
  tenantName: null,
  primaryColor: "oklch(0.205 0 0)",
  accentColor: "oklch(0.97 0 0)",
  logoUrl: null,
  domain: null,
  isResolved: false,
  hostnameCheckComplete: false,

  resolveBySlug: async (slug: string) => {
    if (get().isResolved) return;

    try {
      const res = await fetch(`${API_URL}/tenants/${slug}`, {
        credentials: "include",
      });
      if (!res.ok) return;

      const { data } = await res.json();
      setTenantFromResponse(set, data);
      get().applyTheme();
    } catch {
      // Path-based resolution failed — tenant not found
    }
  },

  resolveByHostname: async (hostname: string) => {
    try {
      const res = await fetch(
        `${API_URL}/tenants/resolve?hostname=${encodeURIComponent(hostname)}`,
      );
      if (!res.ok) return;

      const { data } = await res.json();
      setTenantFromResponse(set, data);
      get().applyTheme();
    } catch {
      // Hostname resolution failed — fall through to path-based
    } finally {
      set({ hostnameCheckComplete: true });
    }
  },

  applyTheme: () => {
    const { primaryColor, accentColor } = get();
    const root = document.documentElement;
    root.style.setProperty("--tenant-primary", primaryColor);
    root.style.setProperty("--tenant-accent", accentColor);
  },
}));
