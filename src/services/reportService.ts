import { createClient } from "@/services/supabase/server";
import { getActiveBorrows } from "@/services/returnService";
import type {
  AdminStats,
  MonthlyBorrowTrend,
  ActivityLog,
  ActiveBorrow,
  Book,
  BorrowHistoryRow,
  Fine,
  Profile,
} from "@/types";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";

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
  return getActiveBorrows({ overdueOnly: true });
}

export async function getActiveLoansReport(): Promise<ActiveBorrow[]> {
  return getActiveBorrows();
}

export async function getInventoryReport(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, isbn, title, subtitle, description, author_id, publisher_id, category_id, published_year, edition, language, total_copies, available_copies, cover_url, pdf_url, shelf_number, rack_number, status, deleted_at, created_at, updated_at, author:authors(name), category:categories(name), publisher:publishers(name)"
    )
    .is("deleted_at", null)
    .order("title");

  if (error) throw new Error(`getInventoryReport failed: ${error.message}`);
  return (data ?? []) as unknown as Book[];
}

export async function getBorrowingHistoryReport(): Promise<BorrowHistoryRow[]> {
  const supabase = await createClient();
  const { data: issues, error } = await supabase
    .from("issued_books")
    .select("id, book_id, member_id, issue_date, due_date, returned_date, status")
    .order("issue_date", { ascending: false })
    .limit(500);

  if (error) throw new Error(`getBorrowingHistory failed: ${error.message}`);
  if (!issues?.length) return [];

  const bookIds = [...new Set(issues.map((r) => r.book_id))];
  const memberIds = [...new Set(issues.map((r) => r.member_id))];

  const [{ data: books }, { data: members }] = await Promise.all([
    supabase.from("books").select("id, title").in("id", bookIds),
    supabase.from("profiles").select("id, full_name, email").in("id", memberIds),
  ]);

  const bookById = new Map((books ?? []).map((b) => [b.id, b.title as string]));
  const memberById = new Map(
    (members ?? []).map((m) => [m.id, { name: m.full_name as string, email: m.email as string }])
  );

  return issues.map((row) => {
    const member = memberById.get(row.member_id);
    return {
      id: row.id,
      issue_date: row.issue_date,
      due_date: row.due_date,
      returned_date: row.returned_date,
      status: row.status,
      book_title: bookById.get(row.book_id) ?? "Unknown",
      member_name: member?.name ?? "Unknown",
      member_email: member?.email ?? "",
    };
  });
}

export async function getFinesReport(): Promise<Fine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select(
      "id, issued_book_id, member_id, overdue_days, rate_per_day, total_amount, status, paid_at, notes, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`getFinesReport failed: ${error.message}`);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const memberIds = [...new Set(rows.map((r) => r.member_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", memberIds);

  if (profileError) throw new Error(`getFinesReport profiles failed: ${profileError.message}`);

  const byId = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, email: p.email }])
  );

  return rows.map((row) => ({
    ...row,
    waived_at: null,
    waived_by: null,
    member: byId.get(row.member_id),
  })) as Fine[];
}

export async function getMembersReport(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("role", "member")
    .order("full_name");

  if (error) throw new Error(`getMembersReport failed: ${error.message}`);
  return (data ?? []) as Profile[];
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
      "id, issue_date, due_date, status, overdue_days, book_id, book_title, cover_url, shelf_number, rack_number, member_id, member_name, member_email, member_phone"
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

export interface ReportsData {
  stats: AdminStats;
  trend: MonthlyBorrowTrend[];
  overdue: ActiveBorrow[];
  activeLoans: ActiveBorrow[];
  inventory: Book[];
  history: BorrowHistoryRow[];
  fines: Fine[];
  members: Profile[];
}

export async function getReportsData(): Promise<ReportsData> {
  const [
    stats,
    trend,
    overdue,
    activeLoans,
    inventory,
    history,
    fines,
    members,
  ] = await Promise.all([
    getAdminStats(),
    getMonthlyBorrowTrend(),
    getOverdueReport(),
    getActiveLoansReport(),
    getInventoryReport(),
    getBorrowingHistoryReport(),
    getFinesReport(),
    getMembersReport(),
  ]);

  return { stats, trend, overdue, activeLoans, inventory, history, fines, members };
}
