import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatAccent } from "@/components/features/dashboard/StatCard";
import { cn } from "@/lib/utils";

const sectionStyles: Record<
  StatAccent,
  { card: string; header: string; title: string }
> = {
  brand: {
    card: "border-brand/20 shadow-sm",
    header: "border-b border-brand/10 bg-gradient-to-r from-brand/[0.07] via-brand/[0.03] to-transparent",
    title: "text-brand",
  },
  blue: {
    card: "border-blue-500/20 shadow-sm",
    header: "border-b border-blue-500/10 bg-blue-500/[0.04]",
    title: "text-blue-700 dark:text-blue-300",
  },
  violet: {
    card: "border-violet-500/20 shadow-sm",
    header: "border-b border-violet-500/10 bg-violet-500/[0.04]",
    title: "text-violet-700 dark:text-violet-300",
  },
  emerald: {
    card: "border-emerald-500/20 shadow-sm",
    header: "border-b border-emerald-500/10 bg-emerald-500/[0.04]",
    title: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    card: "border-amber-500/20 shadow-sm",
    header: "border-b border-amber-500/10 bg-amber-500/[0.04]",
    title: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    card: "border-rose-500/20 shadow-sm",
    header: "border-b border-rose-500/10 bg-rose-500/[0.04]",
    title: "text-rose-700 dark:text-rose-300",
  },
  orange: {
    card: "border-orange-500/20 shadow-sm",
    header: "border-b border-orange-500/10 bg-orange-500/[0.04]",
    title: "text-orange-700 dark:text-orange-300",
  },
};

export function SectionCard({
  title,
  description,
  accent = "brand",
  action,
  className,
  contentClassName,
  children,
}: {
  title: ReactNode;
  description?: string;
  accent?: StatAccent;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const styles = sectionStyles[accent];

  return (
    <Card className={cn("min-w-0 overflow-hidden", styles.card, className)}>
      <CardHeader className={cn("px-4 pb-4 sm:px-6", styles.header)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className={cn("text-base sm:text-lg", styles.title)}>
              {title}
            </CardTitle>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className={cn("px-4 pt-4 sm:px-6 sm:pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
