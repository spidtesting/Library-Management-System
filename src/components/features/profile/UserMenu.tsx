"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import type { Profile } from "@/types";
import { signOut } from "@/services/authService";
import { getProfilePath } from "@/lib/constants";
import { UserAvatar } from "./UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const profilePath = getProfilePath(profile.role);

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 items-center gap-2 rounded-lg border px-2 hover:bg-muted data-popup-open:bg-muted"
        aria-label="Account menu"
      >
        <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
          {profile.full_name.split(" ")[0]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary" className="mt-1.5 capitalize">
                {profile.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={profilePath} />}>
            <User className="h-4 w-4" />
            My profile
          </DropdownMenuItem>
          {profile.role === "admin" && (
            <DropdownMenuItem render={<Link href="/admin/settings" />}>
              <Settings className="h-4 w-4" />
              Library settings
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout} variant="destructive">
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
