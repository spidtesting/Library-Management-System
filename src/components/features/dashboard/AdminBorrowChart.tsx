"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { format, parseISO } from "date-fns";
import { BookMarked, RotateCcw, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MonthlyBorrowTrend } from "@/types";

const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

function formatMonthLabel(month: string) {
  try {
    const normalized = month.length === 7 ? `${month}-01` : month;
    return format(parseISO(normalized), "MMM yy");
  } catch {
    return month.slice(0, 7);
  }
}

function formatMonthLong(month: string) {
  try {
    const normalized = month.length === 7 ? `${month}-01` : month;
    return format(parseISO(normalized), "MMMM yyyy");
  } catch {
    return month;
  }
}

type ChartPoint = {
  month: string;
  monthLabel: string;
  issued: number;
  returned: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: ChartPoint;
  }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;

  return (
    <div className="rounded-lg border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {point ? formatMonthLong(point.month) : label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums">{entry.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({
  payload,
}: {
  payload?: { value?: string; color?: string }[];
}) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof BookMarked;
  accent: "brand" | "emerald" | "blue";
}) {
  const styles = {
    brand: {
      box: "border-brand/25 bg-brand/[0.06]",
      icon: "bg-brand/15 text-brand",
      value: "text-brand",
    },
    emerald: {
      box: "border-emerald-500/25 bg-emerald-500/[0.06]",
      icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-300",
    },
    blue: {
      box: "border-blue-500/25 bg-blue-500/[0.06]",
      icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      value: "text-blue-700 dark:text-blue-300",
    },
  }[accent];

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", styles.box)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", styles.icon)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-semibold tabular-nums tracking-tight", styles.value)}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export function AdminBorrowChart({
  data,
  className,
  showSummary = true,
}: {
  data: MonthlyBorrowTrend[];
  className?: string;
  showSummary?: boolean;
}) {
  const chartData = useMemo<ChartPoint[]>(
    () =>
      data.map((d) => ({
        month: d.month,
        monthLabel: formatMonthLabel(d.month),
        issued: d.total_issued,
        returned: d.total_returned,
      })),
    [data]
  );

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, row) => ({
          issued: acc.issued + row.issued,
          returned: acc.returned + row.returned,
        }),
        { issued: 0, returned: 0 }
      ),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20">
        <TrendingUp className="h-8 w-8 text-muted-foreground/50" aria-hidden />
        <p className="text-sm text-muted-foreground">No borrowing data for this period yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {showSummary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryStat
            label="Total issued"
            value={totals.issued}
            icon={BookMarked}
            accent="brand"
          />
          <SummaryStat
            label="Total returned"
            value={totals.returned}
            icon={RotateCcw}
            accent="emerald"
          />
          <SummaryStat
            label="Net circulation"
            value={totals.issued - totals.returned}
            icon={TrendingUp}
            accent="blue"
          />
        </div>
      )}

      <div className="relative h-72 w-full min-w-0 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 via-background to-background p-2 pt-4 sm:p-4 sm:pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
            barGap={6}
            barCategoryGap="22%"
          >
            <defs>
              <linearGradient id="borrowIssuedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="borrowReturnedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="4 6"
              strokeOpacity={0.8}
            />
            <XAxis
              dataKey="monthLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.35, radius: 8 }}
            />
            <Legend content={<ChartLegend />} />
            <Bar
              dataKey="issued"
              fill="url(#borrowIssuedGradient)"
              name="Issued"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="returned"
              fill="url(#borrowReturnedGradient)"
              name="Returned"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
