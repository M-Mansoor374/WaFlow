import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification.store";

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    browserPermission,
    addNotification,
    markRead,
    markAllRead,
    requestPermission,
    toggleSound,
  } = useNotificationStore();

  useEffect(() => {
    if (browserPermission === "default") {
      requestPermission();
    }
  }, [browserPermission, requestPermission]);

  return {
    notifications,
    unreadCount,
    soundEnabled,
    browserPermission,
    addNotification,
    markRead,
    markAllRead,
    toggleSound,
  };
}
