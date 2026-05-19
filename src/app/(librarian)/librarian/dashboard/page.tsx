import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/features/dashboard/StatCard";
import {
  getLibrarianTodayStats,
  getPreOverdueBorrows,
  getOutOfStockBooks,
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
        <StatCard title="Issued today" value={stats.issuedToday} />
        <StatCard title="Returned today" value={stats.returnedToday} />
        <StatCard title="Overdue" value={stats.overdueCount} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Due within 3 days</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <caption className="sr-only">Books due soon</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preOverdue.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.book_title}</TableCell>
                    <TableCell>{row.member_name}</TableCell>
                    <TableCell>{formatDate(row.due_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Out of stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {outOfStock.map((book) => (
                <li key={book.id}>{book.title}</li>
              ))}
              {outOfStock.length === 0 && (
                <p className="text-muted-foreground">All titles have copies available.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
