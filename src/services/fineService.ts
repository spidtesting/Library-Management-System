import { createClient } from "@/services/supabase/server";
import { createAdminClient } from "@/services/supabase/admin";
import type { Fine, PaginatedResponse, Profile } from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const FINE_COLUMNS =
  "id, issued_book_id, member_id, overdue_days, rate_per_day, total_amount, status, paid_at, waived_by, notes, created_at, updated_at";

type FineRow = Omit<Fine, "member"> & { member_id: string };

async function attachMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: FineRow[]
): Promise<Fine[]> {
  if (rows.length === 0) return [];

  const memberIds = [...new Set(rows.map((r) => r.member_id))];
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", memberIds);

  if (error) throw new Error(`getFines profiles failed: ${error.message}`);

  const byId = new Map(
    (profiles ?? []).map((p) => [p.id, p as Pick<Profile, "full_name" | "email">])
  );

  return rows.map((row) => ({
    ...row,
    member: byId.get(row.member_id) ?? undefined,
  }));
}

export async function getFines(params: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse<Fine>> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("fines")
    .select(FINE_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);
  if (error) throw new Error(`getFines failed: ${error.message}`);

  const fines = await attachMembers(supabase, (data ?? []) as FineRow[]);
  const total = count ?? 0;

  return {
    data: fines,
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function payFine(id: string, notes?: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("fines")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq("id", id);

  if (error) throw new Error(`payFine failed: ${error.message}`);
}

export async function waiveFine(id: string, waivedBy: string, notes?: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("fines")
    .update({
      status: "waived",
      waived_by: waivedBy,
      notes: notes ?? null,
    })
    .eq("id", id);

  if (error) throw new Error(`waiveFine failed: ${error.message}`);
}

export async function getMemberFines(memberId: string): Promise<Fine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select(FINE_COLUMNS)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getMemberFines failed: ${error.message}`);
  return attachMembers(supabase, (data ?? []) as FineRow[]);
}
