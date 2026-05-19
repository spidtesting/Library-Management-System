import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getMemberActiveBorrows, getMemberPendingFinesTotal } from "@/services/memberService";
import { getMemberFines } from "@/services/fineService";
import { getSettings } from "@/services/settingsService";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDueDateStatus } from "@/utils/formatDate";
import { calculateFine } from "@/utils/calculateFine";
import { cn } from "@/lib/utils";
import { RecentlyViewed } from "@/components/features/books/RecentlyViewed";
import {
  BookOpen,
  Coins,
  Library,
  Search,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import type { IssuedBook } from "@/types";

export const metadata: Metadata = { title: "Dashboard | Member" };

export default async function MemberDashboardPage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  const [borrows, finesTotal, fines, settings] = await Promise.all([
    getMemberActiveBorrows(profile.id),
    getMemberPendingFinesTotal(profile.id),
    getMemberFines(profile.id),
    getSettings(),
  ]);

  const pendingFines = fines.filter((f) => f.status === "pending");
  const tokensAvailable = Math.max(
    0,
    profile.borrow_token_limit - profile.borrow_tokens_used
  );

  return (
    <div>
      <PageHeader
        title="My dashboard"
        description={`Welcome, ${profile.full_name}`}
        action={
          <Button asChild className="gap-2">
            <Link href="/member/browse">
              <Search className="h-4 w-4" />
              Search catalogue
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tokens available"
          value={tokensAvailable}
          description={`${profile.borrow_tokens_used} of ${profile.borrow_token_limit} in use`}
          icon={Library}
        />
        <StatCard
          title="Books out"
          value={borrows.length}
          description={borrows.length === 1 ? "Active borrow" : "Active borrows"}
          icon={BookOpen}
        />
        <StatCard
          title="Pending fines"
          value={`$${finesTotal.toFixed(2)}`}
          description={
            pendingFines.length > 0
              ? `${pendingFines.length} unpaid fine(s)`
              : "No outstanding fines"
          }
          icon={Coins}
        />
        <StatCard
          title="Borrow access"
          value={profile.is_active ? "Can borrow" : "Blocked"}
          description={
            profile.is_active
              ? "You can issue and reserve books"
              : "Contact the library to restore access"
          }
          icon={profile.is_active ? ShieldCheck : ShieldOff}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Active borrows</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/member/browse">Browse books</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {borrows.map((b) => (
              <BorrowCard
                key={b.id}
                borrow={b}
                finePerDay={settings.fine_per_day}
              />
            ))}
            {borrows.length === 0 && (
              <p className="text-muted-foreground text-sm sm:col-span-2">
                No active borrows.{" "}
                <Link href="/member/browse" className="text-brand underline">
                  Search the catalogue
                </Link>{" "}
                to find your next read.
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
              <ul className="text-sm space-y-2">
                {pendingFines.map((f) => (
                  <li key={f.id} className="flex justify-between gap-2">
                    <span>{f.overdue_days} days overdue</span>
                    <span className="font-medium tabular-nums">
                      ${Number(f.total_amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Pay fines at the library desk.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <RecentlyViewed className="mt-6" />
    </div>
  );
}

function BorrowCard({
  borrow,
  finePerDay,
}: {
  borrow: IssuedBook;
  finePerDay: number;
}) {
  const status = getDueDateStatus(borrow.due_date);
  const fine = calculateFine(borrow.due_date, finePerDay);

  const statusLabel =
    status === "overdue"
      ? "Overdue"
      : status === "warning"
        ? "Due soon"
        : "On time";

  const statusVariant =
    status === "overdue"
      ? "destructive"
      : status === "warning"
        ? "secondary"
        : "outline";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm space-y-2",
        status === "overdue" && "border-destructive/50 bg-destructive/5",
        status === "warning" && "border-brand/50 bg-brand/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{borrow.book?.title ?? "Book"}</p>
        <Badge variant={statusVariant} className="shrink-0 text-xs">
          {statusLabel}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">
        Issued {formatDate(borrow.issue_date)}
      </p>
      <p className="text-muted-foreground">
        Due <span className="font-medium text-foreground">{formatDate(borrow.due_date)}</span>
      </p>
      {fine.isOverdue && (
        <p className="text-destructive text-xs">
          Est. late fee: ${fine.amount.toFixed(2)} ({fine.overdueDays} day
          {fine.overdueDays === 1 ? "" : "s"} × ${finePerDay.toFixed(2)}/day)
        </p>
      )}
    </div>
  );
}
