import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: "message" | "system" | "alert";
}

interface NotificationState {
  notifications: AppNotification[];
  soundEnabled: boolean;
  browserPermission: NotificationPermission | "default";
  unreadCount: number;

  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  requestPermission: () => Promise<void>;
  toggleSound: () => void;
  clearAll: () => void;
}

let notifCounter = 0;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  soundEnabled: true,
  browserPermission: typeof Notification !== "undefined" ? Notification.permission : "default",
  unreadCount: 0,

  addNotification: (n) => {
    const notification: AppNotification = {
      ...n,
      id: `notif_${++notifCounter}_${Date.now()}`,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    }));

    if (get().soundEnabled) {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // Audio playback not supported
      }
    }

    if (get().browserPermission === "granted" && document.hidden) {
      try {
        new Notification(notification.title, { body: notification.body });
      } catch {
        // Browser notification failed
      }
    }
  },

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  requestPermission: async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    set({ browserPermission: permission });
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
