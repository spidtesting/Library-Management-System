"use client";

import { Menu, BookOpen } from "lucide-react";
import type { Profile } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/features/notifications/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/features/profile/UserMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import { getProfilePath } from "@/lib/constants";
import { UserAvatar } from "@/components/features/profile/UserAvatar";

export function Navbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = getNavItems(profile.role);
  const profilePath = getProfilePath(profile.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-3 backdrop-blur-md safe-area-x pt-[env(safe-area-inset-top)] sm:px-4 lg:pt-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
        <Sheet>
          <SheetTrigger
            className="touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border hover:bg-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-brand" />
                Library
              </SheetTitle>
            </SheetHeader>
            <nav
              className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
              aria-label="Mobile navigation"
            >
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-brand")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t p-3 safe-area-bottom">
              <Link
                href={profilePath}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
              >
                <UserAvatar
                  name={profile.full_name}
                  avatarUrl={profile.avatar_url}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{profile.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {profile.role} · View profile
                  </p>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href={items[0]?.href ?? profilePath}
          className="flex min-w-0 items-center gap-2 lg:hidden"
        >
          <BookOpen className="h-4 w-4 shrink-0 text-brand" aria-hidden />
          <span className="truncate text-sm font-semibold">Library</span>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <ThemeToggle />
        <NotificationBell userId={profile.id} />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
