import { createClient } from "@/services/supabase/server";
import { createAdminClient } from "@/services/supabase/admin";
import { createSignUpClient } from "@/services/supabase/signup-client";
import { isServiceRoleConfigured } from "@/lib/supabase/service-role";
import type { Profile, IssuedBook, PaginatedResponse, UserRole } from "@/types";
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
      `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,nic_number.ilike.%${params.search}%`
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
  const supabase = await createClient();
  const payload = emptyToNull(updates as Record<string, unknown>);
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .eq("role", "member")
    .select("id")
    .maybeSingle();
  if (error) {
    throw new Error(
      error.message.includes("row-level security")
        ? "updateMember failed: not allowed (run supabase/fix-member-create.sql or sign in as admin/librarian)"
        : `updateMember failed: ${error.message}`
    );
  }
  if (!data) throw new Error("Member not found");
}

async function rollbackAuthUser(userId: string) {
  if (!isServiceRoleConfigured()) return;
  try {
    await createAdminClient().auth.admin.deleteUser(userId);
  } catch {
    // best-effort cleanup
  }
}

function mapAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("already") || msg.includes("registered")) {
    return "A user with this email already exists";
  }
  if (msg.includes("rate limit")) {
    return (
      "Email rate limit exceeded. Wait a few minutes and try again, or add SUPABASE_SECRET_KEY to .env.local " +
      "(Dashboard → API → Secret key) so accounts are created without sending signup emails."
    );
  }
  if (msg.includes("signups not allowed") || msg.includes("signup is disabled")) {
    return "Email signups are disabled in Supabase. Enable them under Authentication → Providers → Email.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "That email address is not accepted. Use a standard address (e.g. @gmail.com).";
  }
  if (msg.includes("database error") || msg.includes("trigger")) {
    return "Auth signup failed (broken profile trigger). Run supabase/fix-member-create.sql in the SQL Editor.";
  }
  return message;
}

async function createAuthUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ userId: string }> {
  if (isServiceRoleConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw new Error(mapAuthError(error.message));
    if (!data.user?.id) throw new Error("Account was not created");
    return { userId: data.user.id };
  }

  const signUpClient = createSignUpClient();
  const { data, error } = await signUpClient.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.user?.id) {
    throw new Error(
      "Account was not created. In Supabase → Authentication → Email, disable “Confirm email” for immediate access."
    );
  }
  return { userId: data.user.id };
}

export async function createMember(
  input: MemberCreateInput,
  options?: { forcedRole?: UserRole }
): Promise<Profile> {
  const role: UserRole = options?.forcedRole ?? input.role ?? "member";
  const supabase = await createClient();
  const isLibraryMember = role === "member";

  const { userId } = await createAuthUser(
    input.email,
    input.password,
    input.full_name
  );

  const profilePayload = {
    id: userId,
    email: input.email.toLowerCase(),
    nic_number: isLibraryMember && input.nic_number ? normalizeNic(input.nic_number) : null,
    full_name: input.full_name,
    role,
    phone: input.phone ?? null,
    address: input.address ?? null,
    borrow_token_limit: isLibraryMember ? input.borrow_token_limit : 0,
    borrow_tokens_used: 0,
    is_active: isLibraryMember ? input.is_active : true,
  };

  const { data, error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (profileError) {
    await rollbackAuthUser(userId);
    const msg = profileError.message.toLowerCase();
    if (msg.includes("nic_number") && (msg.includes("does not exist") || msg.includes("column"))) {
      throw new Error(
        "Database missing nic_number column. Run supabase/fix-member-create.sql in the SQL Editor."
      );
    }
    if (msg.includes("row-level security")) {
      throw new Error(
        "Could not save profile. Run supabase/fix-member-create.sql, or only admins can create librarian/admin accounts."
      );
    }
    if (msg.includes("nic_number") || msg.includes("unique")) {
      throw new Error("A member with this NIC number already exists");
    }
    throw new Error(`createMember profile failed: ${profileError.message}`);
  }

  return data as Profile;
}

export async function deleteMember(id: string): Promise<void> {
  const supabase = await createClient();

  const { count, error: borrowError } = await supabase
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

  if (!isServiceRoleConfigured()) {
    throw new Error(
      "Full account delete needs SUPABASE_SECRET_KEY. Block borrowing instead, or add the secret key from Dashboard → API."
    );
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.deleteUser(id);
  if (authError) throw new Error(`deleteMember failed: ${authError.message}`);
}

export async function countActiveBorrows(memberId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
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
