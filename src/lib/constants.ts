export const BORROW_LIMIT = 3;
export const FINE_RATE = 5;
export const MAX_BORROW_DAYS = 14;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_COVER_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const RECENTLY_VIEWED_KEY = "recently_viewed";
export const RECENTLY_VIEWED_MAX = 5;
export const NOTIFICATION_POLL_MS = 30_000;

export const ROLE_DASHBOARD: Record<string, string> = {
  admin: "/admin/dashboard",
  librarian: "/librarian/dashboard",
  member: "/member/dashboard",
};

export const ROLE_PROFILE: Record<string, string> = {
  admin: "/admin/profile",
  librarian: "/librarian/profile",
  member: "/member/profile",
};

export function getProfilePath(role: string): string {
  return ROLE_PROFILE[role] ?? "/member/profile";
}

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/issue", label: "Issue" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/fines", label: "Fines" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export const LIBRARIAN_NAV = [
  { href: "/librarian/dashboard", label: "Dashboard" },
  { href: "/librarian/books", label: "Books" },
  { href: "/librarian/issue", label: "Issue" },
  { href: "/librarian/returns", label: "Returns" },
] as const;

export const MEMBER_NAV = [
  { href: "/member/dashboard", label: "Dashboard" },
  { href: "/member/browse", label: "Browse" },
  { href: "/member/history", label: "History" },
  { href: "/member/notifications", label: "Notifications" },
] as const;
