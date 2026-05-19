import { createClient } from "@/services/supabase/server";
import type { AdminStats, MonthlyBorrowTrend, ActivityLog, ActiveBorrow, Book } from "@/types";

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_admin_stats")
    .select(
      "total_books, available_books, total_members, total_librarians, currently_issued, overdue_count, returned_today, issued_today, pending_fines, collected_fines, out_of_stock_books"
    )
    .single();

  if (error) throw new Error(`getAdminStats failed: ${error.message}`);
  return data as AdminStats;
}

export async function getMonthlyBorrowTrend(): Promise<MonthlyBorrowTrend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_monthly_borrow_trend")
    .select("month, total_issued, total_returned")
    .order("month");

  if (error) throw new Error(`getMonthlyBorrowTrend failed: ${error.message}`);
  return (data ?? []) as MonthlyBorrowTrend[];
}

export async function getRecentActivity(limit = 10): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, actor_id, action, entity, entity_id, metadata, created_at, actor:profiles(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getRecentActivity failed: ${error.message}`);
  return (data ?? []) as unknown as ActivityLog[];
}

export async function getOverdueReport(): Promise<ActiveBorrow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_active_borrows")
    .select(
      "id, issue_date, due_date, status, overdue_days, book_id, book_title, cover_url, shelf_number, rack_number, member_id, member_name, member_email, member_phone"
    )
    .gt("overdue_days", 0)
    .order("overdue_days", { ascending: false });

  if (error) throw new Error(`getOverdueReport failed: ${error.message}`);
  return (data ?? []) as ActiveBorrow[];
}

export async function getInventoryReport(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, isbn, total_copies, available_copies, status, shelf_number, rack_number, category:categories(name)"
    )
    .is("deleted_at", null)
    .order("title");

  if (error) throw new Error(`getInventoryReport failed: ${error.message}`);
  return (data ?? []) as unknown as Book[];
}

export async function getBorrowingHistoryReport() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issued_books")
    .select(
      "id, issue_date, due_date, returned_date, status, book:books(title), member:profiles!member_id(full_name, email)"
    )
    .order("issue_date", { ascending: false })
    .limit(500);

  if (error) throw new Error(`getBorrowingHistory failed: ${error.message}`);
  return data ?? [];
}

export async function getLibrarianTodayStats() {
  const stats = await getAdminStats();
  return {
    issuedToday: stats.issued_today,
    returnedToday: stats.returned_today,
    overdueCount: stats.overdue_count,
  };
}

export async function getPreOverdueBorrows(days = 3): Promise<ActiveBorrow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_active_borrows")
    .select(
      "id, issue_date, due_date, status, overdue_days, book_id, book_title, cover_url, member_id, member_name, member_email"
    )
    .eq("status", "issued")
    .lte("due_date", new Date(Date.now() + days * 86400000).toISOString().split("T")[0])
    .gte("due_date", new Date().toISOString().split("T")[0])
    .order("due_date");

  if (error) throw new Error(`getPreOverdue failed: ${error.message}`);
  return (data ?? []) as ActiveBorrow[];
}

export async function getOutOfStockBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, cover_url, total_copies, available_copies, shelf_number")
    .is("deleted_at", null)
    .eq("available_copies", 0)
    .limit(20);

  if (error) throw new Error(`getOutOfStock failed: ${error.message}`);
  return (data ?? []) as unknown as Book[];
}
