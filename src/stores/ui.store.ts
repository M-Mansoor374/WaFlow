import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: ThemeMode;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      theme: "system",

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      setTheme: (theme) => {
        set({ theme });

        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
        } else if (theme === "light") {
          root.classList.remove("dark");
        } else {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;
          root.classList.toggle("dark", prefersDark);
        }
      },
    }),
    {
      name: "waflow-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
);
