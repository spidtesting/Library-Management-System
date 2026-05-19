"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAllRead, isLoading } =
    useNotifications(userId);

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && unreadCount > 0) markAllRead();
      }}
    >
      <PopoverTrigger
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]"
            variant="destructive"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationPanel
          notifications={notifications}
          isLoading={isLoading}
        />
      </PopoverContent>
    </Popover>
  );
}
