import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getOverdueReport,
  getInventoryReport,
  getBorrowingHistoryReport,
} from "@/services/reportService";
import { ReportsClient } from "@/components/features/reports/ReportsClient";

export const metadata: Metadata = { title: "Reports | Admin" };

export default async function AdminReportsPage() {
  const [overdue, inventory, history] = await Promise.all([
    getOverdueReport(),
    getInventoryReport(),
    getBorrowingHistoryReport(),
  ]);

  return (
    <div>
      <PageHeader title="Reports" description="Export library data" />
      <ReportsClient
        overdue={overdue}
        inventory={inventory}
        history={history as Record<string, unknown>[]}
      />
    </div>
  );
}
