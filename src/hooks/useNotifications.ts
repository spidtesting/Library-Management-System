"use client";

import useSWR from "swr";
import { NOTIFICATION_POLL_MS } from "@/lib/constants";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/notificationService";

export function useNotifications(userId: string) {
  const { data, isLoading, mutate } = useSWR(
    userId ? `notifications-${userId}` : null,
    () => getNotifications(userId),
    { refreshInterval: NOTIFICATION_POLL_MS }
  );

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAllRead() {
    await markAllNotificationsRead(userId);
    mutate();
  }

  return { notifications, unreadCount, isLoading, markAllRead, mutate };
}
