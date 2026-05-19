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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
      <Sheet>
        <SheetTrigger
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-brand" />
              Library
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label="Mobile navigation">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active && "text-brand")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t p-3">
            <Link
              href={profilePath}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
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
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell userId={profile.id} />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
