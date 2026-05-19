import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDueDateStatus(dueDate: string): "ok" | "warning" | "overdue" {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = differenceInDays(due, today);
  if (daysLeft < 0 || isPast(due)) return "overdue";
  if (daysLeft <= 3) return "warning";
  return "ok";
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
