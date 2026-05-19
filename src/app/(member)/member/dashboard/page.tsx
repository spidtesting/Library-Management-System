import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getMemberActiveBorrows, getMemberPendingFinesTotal } from "@/services/memberService";
import { getMemberFines } from "@/services/fineService";
import { MemberCard } from "@/components/features/members/MemberCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getDueDateStatus } from "@/utils/formatDate";
import { cn } from "@/lib/utils";
import { RecentlyViewed } from "@/components/features/books/RecentlyViewed";

export const metadata: Metadata = { title: "Dashboard | Member" };

export default async function MemberDashboardPage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  const [borrows, finesTotal, fines] = await Promise.all([
    getMemberActiveBorrows(profile.id),
    getMemberPendingFinesTotal(profile.id),
    getMemberFines(profile.id),
  ]);

  const pendingFines = fines.filter((f) => f.status === "pending");

  return (
    <div>
      <PageHeader title="My dashboard" description={`Welcome, ${profile.full_name}`} />
      <MemberDashboardGrid
        profile={profile}
        finesTotal={finesTotal}
        borrows={borrows}
        pendingFines={pendingFines}
      />
      <RecentlyViewed className="mt-6" />
    </div>
  );
}

function MemberDashboardGrid({
  profile,
  finesTotal,
  borrows,
  pendingFines,
}: {
  profile: Awaited<ReturnType<typeof requirePortalRole>>;
  finesTotal: number;
  borrows: Awaited<ReturnType<typeof getMemberActiveBorrows>>;
  pendingFines: Awaited<ReturnType<typeof getMemberFines>>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <MemberCard member={profile} pendingFines={finesTotal} />
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Active borrows</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {borrows.map((b) => {
              const status = getDueDateStatus(b.due_date);
              return (
                <div
                  key={b.id}
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    status === "overdue" && "border-destructive/50 bg-destructive/5",
                    status === "warning" && "border-brand/50 bg-brand/5"
                  )}
                >
                  <p className="font-medium">{b.book?.title}</p>
                  <p className="text-muted-foreground">Due {formatDate(b.due_date)}</p>
                </div>
              );
            })}
            {borrows.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No active borrows.{" "}
                <Link href="/member/browse" className="text-brand underline">
                  Browse books
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
        {pendingFines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending fines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {pendingFines.map((f) => (
                  <li key={f.id}>
                    ${Number(f.total_amount).toFixed(2)} — {f.overdue_days} days overdue
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
