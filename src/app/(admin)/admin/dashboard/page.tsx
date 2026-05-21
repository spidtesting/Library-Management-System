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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";

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
        <StatCard title="Total books" value={stats.total_books} />
        <StatCard title="Available" value={stats.available_books} />
        <StatCard title="Members" value={stats.total_members} />
        <StatCard title="Currently issued" value={stats.currently_issued} />
        <StatCard title="Overdue" value={stats.overdue_count} />
        <StatCard title="Issued today" value={stats.issued_today} />
        <StatCard title="Returned today" value={stats.returned_today} />
        <StatCard title="Pending fines" value={`$${Number(stats.pending_fines).toFixed(2)}`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Monthly borrowing trend</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <AdminBorrowChart data={trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue books</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <caption className="sr-only">Overdue borrows</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Days late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.slice(0, 8).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.book_title}</TableCell>
                    <TableCell>{row.member_name}</TableCell>
                    <TableCell>{row.overdue_days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {activity.map((log) => (
              <li key={log.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span>
                  {log.actor?.full_name ?? "System"} — {log.action}
                </span>
                <span className="text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
