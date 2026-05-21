import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { AdminBorrowChart } from "@/components/features/dashboard/AdminBorrowChart";
import {
  getAdminStats,
  getMonthlyBorrowTrend,
  getOverdueReport,
  getRecentActivity,
} from "@/services/reportService";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";
import {
  BookOpen,
  Users,
  AlertTriangle,
  CircleDollarSign,
  ClipboardList,
  ArrowUpRight,
  ArrowDownLeft,
  Library,
  TrendingUp,
  Activity,
} from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard | Library" };
export const revalidate = 60;

export default async function AdminDashboardPage() {
  const [stats, trend, overdue, activity] = await Promise.all([
    getAdminStats(),
    getMonthlyBorrowTrend(),
    getOverdueReport(),
    getRecentActivity(8),
  ]);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Library overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total books"
          value={stats.total_books}
          description={`${stats.available_books} available`}
          icon={BookOpen}
          accent="blue"
        />
        <StatCard
          title="Members"
          value={stats.total_members}
          icon={Users}
          accent="violet"
        />
        <StatCard
          title="Currently issued"
          value={stats.currently_issued}
          icon={ClipboardList}
          accent="emerald"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue_count}
          icon={AlertTriangle}
          accent="rose"
          className={stats.overdue_count > 0 ? "ring-1 ring-rose-500/40" : undefined}
        />
        <StatCard
          title="Issued today"
          value={stats.issued_today}
          icon={ArrowUpRight}
          accent="emerald"
        />
        <StatCard
          title="Returned today"
          value={stats.returned_today}
          icon={ArrowDownLeft}
          accent="blue"
        />
        <StatCard
          title="Pending fines"
          value={`$${Number(stats.pending_fines).toFixed(2)}`}
          icon={CircleDollarSign}
          accent="amber"
        />
        <StatCard
          title="Out of stock"
          value={stats.out_of_stock_books}
          icon={Library}
          accent="orange"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
              Monthly borrowing trend
            </span>
          }
          accent="brand"
          contentClassName="min-w-0 pt-4 sm:pt-6"
        >
          <AdminBorrowChart data={trend} />
        </SectionCard>
        <SectionCard title="Overdue books" accent="rose">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <caption className="sr-only">Overdue borrows</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Days late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.slice(0, 8).map((row) => (
                  <TableRow
                    key={row.id}
                    className="bg-rose-500/[0.04] hover:bg-rose-500/[0.08]"
                  >
                    <TableCell className="font-medium">{row.book_title}</TableCell>
                    <TableCell>{row.member_name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{row.overdue_days}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {overdue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No overdue books right now.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </div>
      <SectionCard
        title={
          <span className="inline-flex items-center gap-2">
            <Activity className="h-5 w-5 shrink-0" aria-hidden />
            Recent activity
          </span>
        }
        accent="violet"
        className="mt-6"
        contentClassName="pt-4"
      >
        <ul className="divide-y text-sm">
          {activity.map((log) => (
            <li key={log.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span>
                {log.actor?.full_name ?? "System"} — {log.action}
              </span>
              <span className="text-muted-foreground shrink-0">
                {formatDate(log.created_at)}
              </span>
            </li>
          ))}
          {activity.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">No recent activity.</p>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}
