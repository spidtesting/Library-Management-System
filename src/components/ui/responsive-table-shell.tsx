import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wraps tables with horizontal scroll and a mobile swipe hint. */
export function ResponsiveTableShell({
  children,
  className,
  hint = "Swipe sideways to see more columns",
}: {
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground md:hidden">{hint}</p>
      <div className="-mx-1 overflow-x-auto rounded-md border overscroll-x-contain px-1 md:mx-0 md:px-0">
        {children}
      </div>
    </div>
  );
}
