import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import {
  getLibrarianTodayStats,
  getPreOverdueBorrows,
  getOutOfStockBooks,
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
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Library,
} from "lucide-react";

export const metadata: Metadata = { title: "Librarian Dashboard | Library" };
export const revalidate = 60;

export default async function LibrarianDashboardPage() {
  const [stats, preOverdue, outOfStock] = await Promise.all([
    getLibrarianTodayStats(),
    getPreOverdueBorrows(3),
    getOutOfStockBooks(),
  ]);

  return (
    <div>
      <PageHeader title="Librarian Dashboard" description="Today's desk overview" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Issued today"
          value={stats.issuedToday}
          icon={ArrowUpRight}
          accent="emerald"
        />
        <StatCard
          title="Returned today"
          value={stats.returnedToday}
          icon={ArrowDownLeft}
          accent="blue"
        />
        <StatCard
          title="Overdue"
          value={stats.overdueCount}
          icon={AlertTriangle}
          accent="rose"
          className={stats.overdueCount > 0 ? "ring-1 ring-rose-500/40" : undefined}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={
            <span className="inline-flex items-center gap-2">
              <Clock className="h-5 w-5 shrink-0" aria-hidden />
              Due within 3 days
            </span>
          }
          description="Loans approaching their due date"
          accent="amber"
        >
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <caption className="sr-only">Books due soon</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preOverdue.map((row) => (
                  <TableRow
                    key={row.id}
                    className="bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                  >
                    <TableCell className="font-medium">{row.book_title}</TableCell>
                    <TableCell>{row.member_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      >
                        {formatDate(row.due_date)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {preOverdue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No books due in the next 3 days.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
        <SectionCard
          title={
            <span className="inline-flex items-center gap-2">
              <Library className="h-5 w-5 shrink-0" aria-hidden />
              Out of stock
            </span>
          }
          description="Titles with no copies available"
          accent="orange"
        >
          <ul className="space-y-2 text-sm">
            {outOfStock.map((book) => (
              <li
                key={book.id}
                className="rounded-lg border border-orange-500/20 bg-orange-500/[0.04] px-3 py-2"
              >
                {book.title}
              </li>
            ))}
            {outOfStock.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">
                All titles have copies available.
              </p>
            )}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
