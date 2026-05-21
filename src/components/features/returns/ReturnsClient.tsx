"use client";

import { useState } from "react";
import type { ActiveBorrow } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionCard } from "@/components/ui/section-card";
import { calculateFine } from "@/utils/calculateFine";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { overdueRowClass } from "@/lib/status-badges";

export function ReturnsClient({
  borrows,
  fineRate,
}: {
  borrows: ActiveBorrow[];
  fineRate: number;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ActiveBorrow | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = borrows.filter(
    (b) =>
      b.book_title.toLowerCase().includes(search.toLowerCase()) ||
      b.member_name.toLowerCase().includes(search.toLowerCase())
  );

  const preview = selected
    ? calculateFine(selected.due_date, fineRate)
    : null;

  async function confirmReturn() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issued_book_id: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Return failed");
      toast.success(
        data.fine_amount > 0
          ? `Returned. Fine: $${Number(data.fine_amount).toFixed(2)}`
          : "Book returned successfully"
      );
      setSelected(null);
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Return failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Active loans"
      description="Search and process book returns at the desk"
      accent="emerald"
    >
      <div className="space-y-4">
        <Input
          placeholder="Search by book or member…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search active borrows"
        />
        <ReturnsTable borrows={filtered} onReturn={setSelected} />
      </div>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm return</DialogTitle>
            <DialogDescription>
              {selected?.book_title} — {selected?.member_name}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="text-sm space-y-1">
              <p>Due date: {formatDate(selected!.due_date)}</p>
              {preview.isOverdue ? (
                <p className="text-destructive">
                  Overdue {preview.overdueDays} day(s) — estimated fine: $
                  {preview.amount.toFixed(2)}
                </p>
              ) : (
                <p className="text-emerald-700 dark:text-emerald-300">No fine due</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={confirmReturn}>
              {loading ? "Processing…" : "Confirm return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

function ReturnsTable({
  borrows,
  onReturn,
}: {
  borrows: ActiveBorrow[];
  onReturn: (b: ActiveBorrow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <caption className="sr-only">Active borrows</caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Book</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {borrows.map((b) => {
            const isOverdue = b.overdue_days > 0;
            return (
              <TableRow key={b.id} className={overdueRowClass(isOverdue)}>
                <TableCell className="font-medium">{b.book_title}</TableCell>
                <TableCell>{b.member_name}</TableCell>
                <TableCell>{formatDate(b.due_date)}</TableCell>
                <TableCell>
                  <Badge variant={isOverdue ? "destructive" : "secondary"}>
                    {isOverdue ? `Overdue ${b.overdue_days}d` : "On time"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onReturn(b)}>
                    Return
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {borrows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No active loans match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
