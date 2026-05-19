import { createClient } from "@/services/supabase/server";
import { createAdminClient } from "@/services/supabase/admin";
import type { Profile, IssuedBook, PaginatedResponse } from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { emptyToNull } from "@/lib/sanitize-input";
import type { MemberCreateInput } from "@/lib/validations";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";
import { normalizeNic } from "@/lib/nic";

export async function getMembers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<Profile>> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("profiles")
    .select(PROFILE_COLUMNS, { count: "exact" })
    .eq("role", "member")
    .order("full_name");

  if (params.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    );
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);
  if (error) throw new Error(`getMembers failed: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as Profile[],
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getMemberById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", id)
    .eq("role", "member")
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getMemberActiveBorrows(memberId: string): Promise<IssuedBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issued_books")
    .select(
      "id, book_id, member_id, issued_by, issue_date, due_date, returned_date, status, created_at, updated_at, book:books(id, title, cover_url, shelf_number, rack_number)"
    )
    .eq("member_id", memberId)
    .in("status", ["issued", "overdue"])
    .order("due_date");

  if (error) throw new Error(`getMemberActiveBorrows failed: ${error.message}`);
  return (data ?? []) as unknown as IssuedBook[];
}

export async function getMemberHistory(memberId: string): Promise<IssuedBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issued_books")
    .select(
      "id, book_id, member_id, issued_by, issue_date, due_date, returned_date, status, created_at, updated_at, book:books(id, title, cover_url)"
    )
    .eq("member_id", memberId)
    .order("issue_date", { ascending: false })
    .limit(50);

  if (error) throw new Error(`getMemberHistory failed: ${error.message}`);
  return (data ?? []) as unknown as IssuedBook[];
}

export async function getMemberPendingFinesTotal(memberId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select("total_amount")
    .eq("member_id", memberId)
    .eq("status", "pending");

  if (error) throw new Error(`getMemberFines failed: ${error.message}`);
  return (data ?? []).reduce((sum, f) => sum + Number(f.total_amount), 0);
}

export async function updateMember(
  id: string,
  updates: Partial<Pick<Profile, "is_active" | "borrow_token_limit" | "full_name" | "phone" | "address">>
) {
  const admin = createAdminClient();
  const payload = emptyToNull(updates as Record<string, unknown>);
  const { error } = await admin
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .eq("role", "member");
  if (error) throw new Error(`updateMember failed: ${error.message}`);
}

export async function createMember(input: MemberCreateInput): Promise<Profile> {
  const admin = createAdminClient();

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });

  if (authError) {
    throw new Error(
      authError.message.includes("already")
        ? "A user with this email already exists"
        : authError.message
    );
  }

  const userId = created.user.id;
  const profilePayload = {
    id: userId,
    email: input.email.toLowerCase(),
    nic_number: normalizeNic(input.nic_number),
    full_name: input.full_name,
    role: "member" as const,
    phone: input.phone ?? null,
    address: input.address ?? null,
    borrow_token_limit: input.borrow_token_limit,
    borrow_tokens_used: 0,
    is_active: input.is_active,
  };

  const { data, error: profileError } = await admin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    const msg = profileError.message.toLowerCase();
    if (msg.includes("nic_number") || msg.includes("unique")) {
      throw new Error("A member with this NIC number already exists");
    }
    throw new Error(`createMember profile failed: ${profileError.message}`);
  }

  return data as Profile;
}

export async function deleteMember(id: string): Promise<void> {
  const admin = createAdminClient();

  const { count, error: borrowError } = await admin
    .from("issued_books")
    .select("id", { count: "exact", head: true })
    .eq("member_id", id)
    .in("status", ["issued", "overdue"]);

  if (borrowError) throw new Error(`deleteMember check failed: ${borrowError.message}`);
  if ((count ?? 0) > 0) {
    throw new Error(
      "This member still has books checked out. Return all books first, or turn off borrow access instead of deleting."
    );
  }

  const { error: authError } = await admin.auth.admin.deleteUser(id);
  if (authError) throw new Error(`deleteMember failed: ${authError.message}`);
}

export async function countActiveBorrows(memberId: string): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("issued_books")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .in("status", ["issued", "overdue"]);

  if (error) throw new Error(`countActiveBorrows failed: ${error.message}`);
  return count ?? 0;
}

export async function searchMembersForIssue(search: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("role", "member")
    .eq("is_active", true)
    .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    .limit(limit);

  if (error) throw new Error(`searchMembers failed: ${error.message}`);
  return (data ?? []) as Profile[];
}
