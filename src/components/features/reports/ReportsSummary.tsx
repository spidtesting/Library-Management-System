import { StatCard } from "@/components/features/dashboard/StatCard";
import type { AdminStats } from "@/types";
import {
  BookOpen,
  Users,
  AlertTriangle,
  CircleDollarSign,
  Library,
  ClipboardList,
} from "lucide-react";

export function ReportsSummary({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total books"
        value={stats.total_books}
        description={`${stats.available_books} available`}
        icon={BookOpen}
        accent="blue"
      />
      <StatCard
        title="Members"
        value={stats.total_members}
        description={`${stats.total_librarians} librarians`}
        icon={Users}
        accent="violet"
      />
      <StatCard
        title="On loan"
        value={stats.currently_issued}
        icon={ClipboardList}
        accent="emerald"
      />
      <StatCard
        title="Overdue"
        value={stats.overdue_count}
        icon={AlertTriangle}
        accent="rose"
        className={stats.overdue_count > 0 ? "ring-1 ring-rose-500/40" : undefined}
      />
      <StatCard
        title="Pending fines"
        value={`$${Number(stats.pending_fines).toFixed(2)}`}
        icon={CircleDollarSign}
        accent="amber"
      />
      <StatCard
        title="Out of stock"
        value={stats.out_of_stock_books}
        icon={Library}
        accent="orange"
      />
    </div>
  );
}
