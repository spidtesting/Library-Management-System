import { createAdminClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";
import type { ActiveBorrow, ReturnBookResult } from "@/types";

export async function returnBook(
  issuedBookId: string,
  returnedBy: string
): Promise<ReturnBookResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("return_book", {
    p_issued_book_id: issuedBookId,
    p_returned_by: returnedBy,
  });

  if (error) throw new Error(error.message);
  return data as ReturnBookResult;
}

export async function getActiveBorrows(params?: {
  search?: string;
  overdueOnly?: boolean;
}): Promise<ActiveBorrow[]> {
  const supabase = await createClient();
  let query = supabase.from("v_active_borrows").select(
    "id, issue_date, due_date, status, overdue_days, book_id, book_title, cover_url, shelf_number, rack_number, member_id, member_name, member_email, member_phone"
  );

  if (params?.overdueOnly) {
    query = query.gt("overdue_days", 0);
  }

  const { data, error } = await query.order("due_date");
  if (error) throw new Error(`getActiveBorrows failed: ${error.message}`);

  let rows = (data ?? []) as ActiveBorrow[];
  if (params?.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.book_title.toLowerCase().includes(q) ||
        r.member_name.toLowerCase().includes(q) ||
        r.member_email.toLowerCase().includes(q)
    );
  }
  return rows;
}
