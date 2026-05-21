import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getMemberActiveBorrows, getMemberPendingFinesTotal } from "@/services/memberService";
import { getMemberFines } from "@/services/fineService";
import { getSettings } from "@/services/settingsService";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDueDateStatus } from "@/utils/formatDate";
import { calculateFine } from "@/utils/calculateFine";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Coins,
  Library,
  Search,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { RecentlyViewed } from "@/components/features/books/RecentlyViewed";
import { SectionCard } from "@/components/ui/section-card";
import { buttonVariants } from "@/components/ui/button";
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
          <Link
            href="/member/browse"
            className={cn(buttonVariants(), "gap-2")}
          >
            <Search className="h-4 w-4" />
            Search catalogue
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tokens available"
          value={tokensAvailable}
          description={`${profile.borrow_tokens_used} of ${profile.borrow_token_limit} in use`}
          icon={Library}
          accent="violet"
        />
        <StatCard
          title="Books out"
          value={borrows.length}
          description={borrows.length === 1 ? "Active borrow" : "Active borrows"}
          icon={BookOpen}
          accent="blue"
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
          accent="amber"
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
          accent={profile.is_active ? "emerald" : "rose"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Active borrows"
          accent="emerald"
          className="lg:col-span-2"
          action={
            <Link
              href="/member/browse"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Browse books
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
        </SectionCard>

        {pendingFines.length > 0 && (
          <SectionCard title="Pending fines" accent="amber">
            <ul className="text-sm space-y-2">
              {pendingFines.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2"
                >
                  <span>{f.overdue_days} days overdue</span>
                  <span className="font-medium tabular-nums text-amber-700 dark:text-amber-300">
                    ${Number(f.total_amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Pay fines at the library desk.
            </p>
          </SectionCard>
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

  const statusBadgeClass =
    status === "overdue"
      ? undefined
      : status === "warning"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm space-y-2",
        status === "overdue" && "border-rose-500/40 bg-rose-500/[0.06]",
        status === "warning" && "border-amber-500/40 bg-amber-500/[0.06]",
        status === "ok" && "border-emerald-500/30 bg-emerald-500/[0.04]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{borrow.book?.title ?? "Book"}</p>
        <Badge variant={statusVariant} className={cn("shrink-0 text-xs", statusBadgeClass)}>
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
