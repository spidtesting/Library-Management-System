"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminBorrowChart } from "@/components/features/dashboard/AdminBorrowChart";
import { ReportsSummary } from "@/components/features/reports/ReportsSummary";
import { exportCsv } from "@/utils/exportCsv";
import { formatDate } from "@/utils/formatDate";
import type { ReportsData } from "@/services/reportService";
import type { ActiveBorrow, Book, BorrowHistoryRow, Fine, Profile } from "@/types";
import { Download, Search } from "lucide-react";

function csvDate() {
  return new Date().toISOString().slice(0, 10);
}

function ReportToolbar({
  search,
  onSearchChange,
  placeholder,
  count,
  onExport,
  exportLabel = "Export CSV",
}: {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  count: number;
  onExport: () => void;
  exportLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          aria-label="Search report"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground tabular-nums">{count} rows</span>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onExport}>
          <Download className="h-4 w-4" />
          {exportLabel}
        </Button>
      </div>
    </div>
  );
}

function EmptyReport({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">{message}</p>
  );
}

function filterText<T>(rows: T[], search: string, keys: (keyof T)[]): T[] {
  const q = search.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
  );
}

export function ReportsClient({ data }: { data: ReportsData }) {
  const { stats, trend, overdue, activeLoans, inventory, history, fines, members } = data;

  const [overdueSearch, setOverdueSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [finesSearch, setFinesSearch] = useState("");
  const [membersSearch, setMembersSearch] = useState("");

  const filteredOverdue = useMemo(
    () =>
      filterText(overdue, overdueSearch, [
        "book_title",
        "member_name",
        "member_email",
      ]),
    [overdue, overdueSearch]
  );

  const filteredActive = useMemo(
    () =>
      filterText(activeLoans, activeSearch, [
        "book_title",
        "member_name",
        "member_email",
      ]),
    [activeLoans, activeSearch]
  );

  const filteredInventory = useMemo(
    () =>
      filterText(inventory, inventorySearch, ["title", "isbn", "shelf_number"]),
    [inventory, inventorySearch]
  );

  const filteredHistory = useMemo(
    () =>
      filterText(history, historySearch, [
        "book_title",
        "member_name",
        "member_email",
        "status",
      ]),
    [history, historySearch]
  );

  const filteredFines = useMemo(() => {
    const q = finesSearch.trim().toLowerCase();
    if (!q) return fines;
    return fines.filter(
      (f) =>
        f.status.toLowerCase().includes(q) ||
        (f.member?.full_name ?? "").toLowerCase().includes(q) ||
        (f.member?.email ?? "").toLowerCase().includes(q)
    );
  }, [fines, finesSearch]);

  const filteredMembers = useMemo(
    () =>
      filterText(members, membersSearch, [
        "full_name",
        "email",
        "nic_number",
        "phone",
      ]),
    [members, membersSearch]
  );

  const pendingFinesTotal = fines
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + Number(f.total_amount), 0);

  return (
    <div className="space-y-6">
      <ReportsSummary stats={stats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {overdue.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {overdue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active loans</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly borrowing trend</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminBorrowChart data={trend} />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Issued today</p>
                  <p className="text-2xl font-semibold tabular-nums">{stats.issued_today}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Returned today</p>
                  <p className="text-2xl font-semibold tabular-nums">{stats.returned_today}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Collected fines (all time)</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    ${Number(stats.collected_fines).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Pending fines (report)</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    ${pendingFinesTotal.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top overdue (preview)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {overdue.length === 0 ? (
                  <EmptyReport message="No overdue books right now." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead className="text-right">Days late</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdue.slice(0, 5).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.book_title}</TableCell>
                          <TableCell>{row.member_name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.overdue_days}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <ReportCard
            title="Overdue books"
            description="Active loans past due date"
            search={overdueSearch}
            onSearchChange={setOverdueSearch}
            count={filteredOverdue.length}
            onExport={() =>
              exportCsv(
                filteredOverdue.map((r) => ({
                  book: r.book_title,
                  member: r.member_name,
                  email: r.member_email,
                  phone: r.member_phone ?? "",
                  issue_date: r.issue_date,
                  due_date: r.due_date,
                  overdue_days: r.overdue_days,
                  shelf: r.shelf_number ?? "",
                })),
                `overdue-report-${csvDate()}`
              )
            }
          >
            <OverdueTable rows={filteredOverdue} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="active">
          <ReportCard
            title="Active loans"
            description="All books currently issued"
            search={activeSearch}
            onSearchChange={setActiveSearch}
            count={filteredActive.length}
            onExport={() =>
              exportCsv(
                filteredActive.map((r) => ({
                  book: r.book_title,
                  member: r.member_name,
                  email: r.member_email,
                  issue_date: r.issue_date,
                  due_date: r.due_date,
                  status: r.status,
                  overdue_days: r.overdue_days,
                })),
                `active-loans-${csvDate()}`
              )
            }
          >
            <ActiveLoansTable rows={filteredActive} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="inventory">
          <ReportCard
            title="Book inventory"
            description="Full catalogue with copy counts"
            search={inventorySearch}
            onSearchChange={setInventorySearch}
            count={filteredInventory.length}
            onExport={() =>
              exportCsv(
                filteredInventory.map((b) => ({
                  title: b.title,
                  isbn: b.isbn ?? "",
                  category: b.category?.name ?? "",
                  author: b.author?.name ?? "",
                  total_copies: b.total_copies,
                  available_copies: b.available_copies,
                  status: b.status,
                  shelf: b.shelf_number ?? "",
                  rack: b.rack_number ?? "",
                })),
                `inventory-report-${csvDate()}`
              )
            }
          >
            <InventoryTable rows={filteredInventory} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="history">
          <ReportCard
            title="Borrowing history"
            description="Last 500 issue/return records"
            search={historySearch}
            onSearchChange={setHistorySearch}
            count={filteredHistory.length}
            onExport={() =>
              exportCsv(
                filteredHistory.map((r) => ({
                  book: r.book_title,
                  member: r.member_name,
                  email: r.member_email,
                  issue_date: r.issue_date,
                  due_date: r.due_date,
                  returned_date: r.returned_date ?? "",
                  status: r.status,
                })),
                `borrow-history-${csvDate()}`
              )
            }
          >
            <HistoryTable rows={filteredHistory} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="fines">
          <ReportCard
            title="Fines"
            description="Fine records (latest 500)"
            search={finesSearch}
            onSearchChange={setFinesSearch}
            count={filteredFines.length}
            onExport={() =>
              exportCsv(
                filteredFines.map((f) => ({
                  member: f.member?.full_name ?? "",
                  email: f.member?.email ?? "",
                  overdue_days: f.overdue_days,
                  rate_per_day: f.rate_per_day,
                  total_amount: f.total_amount,
                  status: f.status,
                  created_at: f.created_at,
                  paid_at: f.paid_at ?? "",
                })),
                `fines-report-${csvDate()}`
              )
            }
          >
            <FinesTable rows={filteredFines} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="members">
          <ReportCard
            title="Members"
            description="Registered library members"
            search={membersSearch}
            onSearchChange={setMembersSearch}
            count={filteredMembers.length}
            onExport={() =>
              exportCsv(
                filteredMembers.map((m) => ({
                  full_name: m.full_name,
                  email: m.email,
                  nic_number: m.nic_number ?? "",
                  phone: m.phone ?? "",
                  borrow_tokens: `${m.borrow_tokens_used}/${m.borrow_token_limit}`,
                  can_borrow: m.is_active ? "yes" : "no",
                  joined: m.created_at,
                })),
                `members-report-${csvDate()}`
              )
            }
          >
            <MembersTable rows={filteredMembers} />
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportCard({
  title,
  description,
  search,
  onSearchChange,
  count,
  onExport,
  children,
}: {
  title: string;
  description: string;
  search: string;
  onSearchChange: (v: string) => void;
  count: number;
  onExport: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportToolbar
          search={search}
          onSearchChange={onSearchChange}
          placeholder={`Search ${title.toLowerCase()}…`}
          count={count}
          onExport={onExport}
        />
        <div className="overflow-x-auto rounded-md border">{children}</div>
      </CardContent>
    </Card>
  );
}

function OverdueTable({ rows }: { rows: ActiveBorrow[] }) {
  if (rows.length === 0) return <EmptyReport message="No overdue books match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="text-right">Days late</TableHead>
          <TableHead>Location</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.book_title}</TableCell>
            <TableCell>
              <div>{row.member_name}</div>
              <div className="text-xs text-muted-foreground">{row.member_email}</div>
            </TableCell>
            <TableCell>{formatDate(row.due_date)}</TableCell>
            <TableCell className="text-right">
              <Badge variant="destructive">{row.overdue_days}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {[row.shelf_number, row.rack_number].filter(Boolean).join(" / ") || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ActiveLoansTable({ rows }: { rows: ActiveBorrow[] }) {
  if (rows.length === 0) return <EmptyReport message="No active loans match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.book_title}</TableCell>
            <TableCell>{row.member_name}</TableCell>
            <TableCell>{formatDate(row.issue_date)}</TableCell>
            <TableCell>{formatDate(row.due_date)}</TableCell>
            <TableCell>
              <Badge variant={row.overdue_days > 0 ? "destructive" : "secondary"}>
                {row.overdue_days > 0 ? `Overdue ${row.overdue_days}d` : row.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InventoryTable({ rows }: { rows: Book[] }) {
  if (rows.length === 0) return <EmptyReport message="No books match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Copies</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Shelf</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((book) => (
          <TableRow key={book.id}>
            <TableCell>
              <div className="font-medium">{book.title}</div>
              {book.isbn && (
                <div className="text-xs text-muted-foreground font-mono">{book.isbn}</div>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {book.category?.name ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {book.available_copies}/{book.total_copies}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  book.available_copies === 0
                    ? "destructive"
                    : book.status === "available"
                      ? "default"
                      : "secondary"
                }
              >
                {book.available_copies === 0 ? "Out of stock" : book.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {book.shelf_number ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function HistoryTable({ rows }: { rows: BorrowHistoryRow[] }) {
  if (rows.length === 0) return <EmptyReport message="No history records match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Returned</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.book_title}</TableCell>
            <TableCell>
              <div>{row.member_name}</div>
              <div className="text-xs text-muted-foreground">{row.member_email}</div>
            </TableCell>
            <TableCell>{formatDate(row.issue_date)}</TableCell>
            <TableCell>{formatDate(row.due_date)}</TableCell>
            <TableCell>
              {row.returned_date ? formatDate(row.returned_date) : "—"}
            </TableCell>
            <TableCell>
              <Badge variant={row.status === "returned" ? "secondary" : "outline"}>
                {row.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FinesTable({ rows }: { rows: Fine[] }) {
  if (rows.length === 0) return <EmptyReport message="No fines match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead className="text-right">Days</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div>{row.member?.full_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{row.member?.email}</div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{row.overdue_days}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              ${Number(row.total_amount).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  row.status === "paid"
                    ? "secondary"
                    : row.status === "waived"
                      ? "outline"
                      : "destructive"
                }
              >
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(row.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MembersTable({ rows }: { rows: Profile[] }) {
  if (rows.length === 0) return <EmptyReport message="No members match your search." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>NIC</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tokens</TableHead>
          <TableHead>Borrow</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.full_name}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {row.nic_number ?? "—"}
            </TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell className="tabular-nums">
              {row.borrow_tokens_used}/{row.borrow_token_limit}
            </TableCell>
            <TableCell>
              <Badge variant={row.is_active ? "default" : "destructive"}>
                {row.is_active ? "Can borrow" : "Blocked"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
