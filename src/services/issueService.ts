import { createAdminClient } from "@/services/supabase/admin";
import type { IssuedBook } from "@/types";
import type { IssueInput } from "@/lib/validations";

export async function issueBook(
  input: IssueInput,
  issuedBy: string
): Promise<IssuedBook> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("issue_book", {
    p_book_id: input.book_id,
    p_member_id: input.member_id,
    p_issued_by: issuedBy,
    p_due_date: input.due_date,
  });

  if (error) throw new Error(error.message);
  return data as IssuedBook;
}
