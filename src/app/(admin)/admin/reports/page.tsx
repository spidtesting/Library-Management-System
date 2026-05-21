import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getReportsData } from "@/services/reportService";
import { ReportsClient } from "@/components/features/reports/ReportsClient";

export const metadata: Metadata = { title: "Reports | Admin" };

export const revalidate = 60;

export default async function AdminReportsPage() {
  const data = await getReportsData();

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Library analytics, searchable tables, and CSV exports"
      />
      <ReportsClient data={data} />
    </div>
  );
}
