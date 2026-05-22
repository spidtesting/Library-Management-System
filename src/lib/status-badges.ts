import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export function roleBadgeClass(role: UserRole) {
  switch (role) {
    case "admin":
      return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "librarian":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }
}

export function formatRoleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function borrowAccessBadgeClass(isActive: boolean) {
  return isActive
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : undefined;
}

export function fineStatusBadgeClass(status: string) {
  if (status === "paid") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (status === "waived") {
    return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }
  return undefined;
}

export function bookStatusBadgeClass(book: {
  available_copies: number;
  status: string;
}) {
  if (book.available_copies === 0) return undefined;
  if (book.status === "available") {
    return "bg-emerald-600 hover:bg-emerald-600";
  }
  return undefined;
}

export function borrowHistoryStatusBadgeClass(status: string) {
  if (status === "returned") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export function overdueRowClass(isOverdue: boolean) {
  return cn(
    isOverdue && "bg-rose-500/[0.03] hover:bg-rose-500/[0.07]"
  );
}

export function warningRowClass(isWarning: boolean) {
  return cn(
    isWarning && "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
  );
}
