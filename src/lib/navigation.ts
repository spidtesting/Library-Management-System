import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  CircleDollarSign,
  History,
  LayoutDashboard,
  RotateCcw,
  Search,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ADMIN_NAV,
  LIBRARIAN_NAV,
  MEMBER_NAV,
} from "@/lib/constants";
import type { Profile } from "@/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Books: BookOpen,
  Members: Users,
  Issue: UserPlus,
  Returns: RotateCcw,
  Fines: CircleDollarSign,
  Reports: BarChart3,
  Settings: Settings,
  Browse: Search,
  History: History,
  Notifications: Bell,
};

function withIcons(items: readonly { href: string; label: string }[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    icon: ICONS[item.label] ?? BookMarked,
  }));
}

export const ADMIN_NAV_ITEMS = withIcons(ADMIN_NAV);
export const LIBRARIAN_NAV_ITEMS = withIcons(LIBRARIAN_NAV);
export const MEMBER_NAV_ITEMS = withIcons(MEMBER_NAV);

export function getNavItems(role: Profile["role"]): NavItem[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV_ITEMS;
    case "librarian":
      return LIBRARIAN_NAV_ITEMS;
    default:
      return MEMBER_NAV_ITEMS;
  }
}
