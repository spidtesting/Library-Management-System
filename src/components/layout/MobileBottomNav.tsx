"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/types";
import { getNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = getNavItems(profile.role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Quick navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul
        className={cn(
          "flex items-stretch gap-0.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          items.length <= 4 ? "justify-around" : "justify-start"
        )}
      >
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-[4.25rem] touch-target flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors sm:min-w-[4.75rem] sm:text-xs",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="max-w-[4.5rem] truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
