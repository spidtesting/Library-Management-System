import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatAccent =
  | "brand"
  | "blue"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "orange";

const accentStyles: Record<
  StatAccent,
  { card: string; icon: string; value: string }
> = {
  brand: {
    card: "border-brand/30 bg-brand/[0.04]",
    icon: "bg-brand/15 text-brand",
    value: "text-foreground",
  },
  blue: {
    card: "border-blue-500/30 bg-blue-500/[0.05]",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
  },
  violet: {
    card: "border-violet-500/30 bg-violet-500/[0.05]",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    value: "text-violet-700 dark:text-violet-300",
  },
  emerald: {
    card: "border-emerald-500/30 bg-emerald-500/[0.05]",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    card: "border-amber-500/30 bg-amber-500/[0.05]",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    card: "border-rose-500/30 bg-rose-500/[0.05]",
    icon: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-300",
  },
  orange: {
    card: "border-orange-500/30 bg-orange-500/[0.05]",
    icon: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-300",
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  accent?: StatAccent;
  className?: string;
}) {
  const styles = accent ? accentStyles[accent] : null;

  return (
    <Card
      className={cn(
        "border-border/60 shadow-sm",
        styles?.card,
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              styles?.value
            )}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              styles?.icon ?? "bg-muted text-brand"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
