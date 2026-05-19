import { createClient } from "@/services/supabase/client";
import type { Notification } from "@/types";

const COLUMNS =
  "id, user_id, type, title, message, related_id, is_read, created_at";

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`getNotifications failed: ${error.message}`);
  return (data ?? []) as Notification[];
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(`markAllRead failed: ${error.message}`);
}
