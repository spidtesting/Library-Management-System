import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { createClient } from "@/services/supabase/server";
import { formatRelative } from "@/utils/formatDate";
import { SectionCard } from "@/components/ui/section-card";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications | Member" };

function notificationAccent(type: string) {
  if (type.includes("overdue")) return "border-rose-500/20 bg-rose-500/[0.04]";
  if (type.includes("fine")) return "border-amber-500/20 bg-amber-500/[0.04]";
  if (type.includes("issue") || type.includes("borrow")) {
    return "border-emerald-500/20 bg-emerald-500/[0.04]";
  }
  return "border-brand/20 bg-brand/[0.04]";
}

export default async function MemberNotificationsPage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, message, is_read, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader title="Notifications" />
      <SectionCard
        title={
          <span className="inline-flex items-center gap-2">
            <Bell className="h-5 w-5 shrink-0" aria-hidden />
            Your notifications
          </span>
        }
        accent="brand"
      >
        <ul className="space-y-2">
          {(notifications ?? []).map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-lg border px-3 py-3 text-sm",
                notificationAccent(n.type),
                !n.is_read ? "font-medium" : "text-muted-foreground"
              )}
            >
              <p>{n.title}</p>
              <p className="text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelative(n.created_at)}</p>
            </li>
          ))}
          {(notifications ?? []).length === 0 && (
            <p className="py-4 text-center text-muted-foreground">No notifications</p>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}
