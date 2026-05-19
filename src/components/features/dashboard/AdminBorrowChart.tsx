"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyBorrowTrend } from "@/types";

const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

export function AdminBorrowChart({ data }: { data: MonthlyBorrowTrend[] }) {
  const chartData = data.map((d) => ({
    month: d.month.slice(0, 7),
    issued: d.total_issued,
    returned: d.total_returned,
  }));

  return (
    <div className="h-64 min-h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height={256} minHeight={256}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar dataKey="issued" fill="var(--chart-1)" name="Issued" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returned" fill="var(--chart-2)" name="Returned" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
