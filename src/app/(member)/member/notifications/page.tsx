import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { createClient } from "@/services/supabase/server";
import { formatRelative } from "@/utils/formatDate";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Notifications | Member" };

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
      <Card>
        <CardContent className="pt-6">
          <ul className="divide-y">
            {(notifications ?? []).map((n) => (
              <li
                key={n.id}
                className={`py-3 text-sm ${!n.is_read ? "font-medium" : "text-muted-foreground"}`}
              >
                <p>{n.title}</p>
                <p className="text-muted-foreground">{n.message}</p>
                <p className="text-xs mt-1">{formatRelative(n.created_at)}</p>
              </li>
            ))}
            {(notifications ?? []).length === 0 && (
              <p className="text-muted-foreground">No notifications</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
