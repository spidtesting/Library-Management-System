"use client";

import {
  Bell,
  BookMarked,
  BookOpen,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { Notification, NotificationType } from "@/types";
import { formatRelative } from "@/utils/formatDate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<NotificationType, React.ElementType> = {
  due_reminder: Bell,
  overdue_alert: AlertTriangle,
  book_returned: BookOpen,
  book_issued: BookMarked,
  reservation_ready: BookMarked,
  general: Info,
};

export function NotificationPanel({
  notifications,
  isLoading,
}: {
  notifications: Notification[];
  isLoading: boolean;
}) {
  return (
    <div className="border-b px-4 py-3">
      <h3 className="font-semibold text-sm">Notifications</h3>
      <ScrollArea className="mt-2 h-72">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </p>
        ) : (
          <ul className="divide-y">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] ?? Info;
              return (
                <li
                  key={n.id}
                  className={`flex gap-3 p-3 text-sm ${!n.is_read ? "bg-muted/50" : ""}`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelative(n.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
