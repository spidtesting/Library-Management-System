"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { exportCsv } from "@/utils/exportCsv";
import type { ActiveBorrow, Book } from "@/types";

export function ReportsClient({
  overdue,
  inventory,
  history,
}: {
  overdue: ActiveBorrow[];
  inventory: Book[];
  history: Record<string, unknown>[];
}) {
  return (
    <Tabs defaultValue="overdue">
      <TabsList>
        <TabsTrigger value="overdue">Overdue</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="history">Borrowing history</TabsTrigger>
      </TabsList>
      <TabsContent value="overdue" className="space-y-4">
        <Button
          onClick={() =>
            exportCsv(
              overdue.map((r) => ({
                book: r.book_title,
                member: r.member_name,
                email: r.member_email,
                due_date: r.due_date,
                overdue_days: r.overdue_days,
              })),
              "overdue-report"
            )
          }
        >
          Export CSV
        </Button>
        <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
          {JSON.stringify(overdue.slice(0, 20), null, 2)}
        </pre>
      </TabsContent>
      <TabsContent value="inventory" className="space-y-4">
        <Button
          onClick={() =>
            exportCsv(
              inventory.map((b) => ({
                title: b.title,
                isbn: b.isbn,
                total: b.total_copies,
                available: b.available_copies,
                shelf: b.shelf_number,
              })),
              "inventory-report"
            )
          }
        >
          Export CSV
        </Button>
        <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
          {JSON.stringify(inventory.slice(0, 20), null, 2)}
        </pre>
      </TabsContent>
      <TabsContent value="history" className="space-y-4">
        <Button
          onClick={() => exportCsv(history as Record<string, unknown>[], "borrow-history")}
        >
          Export CSV
        </Button>
        <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
          {JSON.stringify(history.slice(0, 20), null, 2)}
        </pre>
      </TabsContent>
    </Tabs>
  );
}
