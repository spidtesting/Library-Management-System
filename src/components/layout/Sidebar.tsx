"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { getNavItems } from "@/lib/navigation";
import { getProfilePath } from "@/lib/constants";
import { UserAvatar } from "@/components/features/profile/UserAvatar";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = getNavItems(profile.role);
  const profilePath = getProfilePath(profile.role);
  const profileActive =
    pathname === profilePath || pathname.startsWith(`${profilePath}/`);

  return (
    <aside
      className={cn(
        "hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex supports-[height:100dvh]:h-dvh",
        collapsed ? "w-[4.25rem]" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BookOpen className="h-4 w-4" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Library</p>
            <p className="truncate text-xs text-sidebar-foreground/70 capitalize">
              {profile.role} portal
            </p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 p-2" aria-label="Main navigation">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                active && "ring-1 ring-sidebar-border"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-brand" : "opacity-70"
                )}
                aria-hidden
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <Link
          href={profilePath}
          title={collapsed ? profile.full_name : undefined}
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent/60",
            profileActive && "bg-sidebar-accent ring-1 ring-sidebar-border",
            collapsed && "justify-center px-0"
          )}
        >
          <UserAvatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size="sm"
            className="shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-medium text-sidebar-accent-foreground">
                {profile.full_name}
              </p>
              <p className="truncate text-sidebar-foreground/70">My profile</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
