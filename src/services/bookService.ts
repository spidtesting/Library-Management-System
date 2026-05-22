import { createClient } from "@/services/supabase/server";
import { createAdminClient } from "@/services/supabase/admin";
import type { Book, PaginatedResponse, Category, Author } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { BookInput } from "@/lib/validations";
import { sanitizeBookInput } from "@/lib/sanitize-input";

const BOOK_COLUMNS =
  "id, isbn, title, subtitle, description, author_id, publisher_id, category_id, published_year, edition, language, total_copies, available_copies, cover_url, pdf_url, shelf_number, rack_number, status, deleted_at, created_at, updated_at, author:authors(name), category:categories(name), publisher:publishers(name)";

export interface GetBooksParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  availableOnly?: boolean;
  status?: string;
}

export async function getBooks(
  params: GetBooksParams = {}
): Promise<PaginatedResponse<Book>> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("books")
    .select(BOOK_COLUMNS, { count: "exact" })
    .is("deleted_at", null)
    .order("title");

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }
  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }
  if (params.availableOnly) {
    query = query.gt("available_copies", 0).eq("status", "available");
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);
  if (error) throw new Error(`getBooks failed: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as unknown as Book[],
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return data as unknown as Book;
}

async function resolveAuthorId(
  supabase: SupabaseClient,
  authorName?: string,
  existingAuthorId?: string | null
): Promise<string | null> {
  if (existingAuthorId) return existingAuthorId;
  const trimmed = authorName?.trim();
  if (!trimmed) return null;

  const { data: existing, error: findError } = await supabase
    .from("authors")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();

  if (findError) throw new Error(`resolveAuthorId failed: ${findError.message}`);
  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("authors")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: retry, error: retryError } = await supabase
        .from("authors")
        .select("id")
        .ilike("name", trimmed)
        .single();
      if (retryError) throw new Error(`resolveAuthorId failed: ${retryError.message}`);
      return retry?.id ?? null;
    }
    throw new Error(`resolveAuthorId failed: ${insertError.message}`);
  }

  return created.id;
}

export async function createBook(input: BookInput) {
  const supabase = await createClient();
  const author_id = await resolveAuthorId(
    supabase,
    input.author_name,
    input.author_id ?? null
  );
  const payload = sanitizeBookInput({ ...input, author_id });

  const { cover_url, ...bookFields } = payload;
  const insertRow = {
    ...bookFields,
    available_copies: bookFields.total_copies ?? 1,
    ...(cover_url ? { cover_url } : {}),
  };

  const { data, error } = await supabase
    .from("books")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      error.message.includes("row-level security")
        ? "createBook failed: not allowed (sign in as admin/librarian or set SUPABASE_SECRET_KEY)"
        : `createBook failed: ${error.message}`
    );
  }
  return data;
}

export async function updateBook(id: string, input: Partial<BookInput>) {
  const supabase = await createClient();
  const author_id =
    input.author_name !== undefined || input.author_id !== undefined
      ? await resolveAuthorId(
          supabase,
          input.author_name,
          input.author_id ?? null
        )
      : undefined;
  const payload = sanitizeBookInput({
    ...input,
    ...(author_id !== undefined ? { author_id } : {}),
  });

  if (payload.total_copies !== undefined) {
    const existing = await getBookById(id);
    if (existing) {
      const diff = payload.total_copies - existing.total_copies;
      const nextAvailable = Math.min(
        Math.max(0, existing.available_copies + diff),
        payload.total_copies
      );
      (payload as Partial<BookInput> & { available_copies?: number }).available_copies =
        nextAvailable;
    }
  }

  const { cover_url, ...bookFields } = payload;
  const updateRow = {
    ...bookFields,
    ...(cover_url !== undefined ? { cover_url } : {}),
  };

  const { error } = await supabase.from("books").update(updateRow).eq("id", id);
  if (error) throw new Error(`updateBook failed: ${error.message}`);
}

export async function softDeleteBook(id: string) {
  const supabase = await createClient();

  const { count, error: borrowError } = await supabase
    .from("issued_books")
    .select("id", { count: "exact", head: true })
    .eq("book_id", id)
    .in("status", ["issued", "overdue"]);

  if (borrowError) {
    throw new Error(`softDeleteBook check failed: ${borrowError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new Error(
      "Cannot delete this book while copies are still on loan. Return all copies first."
    );
  }

  const { data, error } = await supabase
    .from("books")
    .update({ deleted_at: new Date().toISOString(), status: "deleted" })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message.includes("row-level security")
        ? "softDeleteBook failed: not allowed (sign in as admin or set SUPABASE_SECRET_KEY)"
        : `softDeleteBook failed: ${error.message}`
    );
  }
  if (!data) {
    throw new Error("Book not found or already deleted");
  }
}

export async function uploadCover(bookId: string, file: Buffer, contentType: string) {
  const admin = createAdminClient();
  const path = `covers/${bookId}.webp`;
  const { error: uploadError } = await admin.storage
    .from("book-covers")
    .upload(path, file, { upsert: true, contentType });

  if (uploadError) throw new Error(`uploadCover failed: ${uploadError.message}`);

  const { data: urlData } = admin.storage.from("book-covers").getPublicUrl(path);
  const { error } = await admin
    .from("books")
    .update({ cover_url: urlData.publicUrl })
    .eq("id", bookId);

  if (error) throw new Error(`uploadCover db update failed: ${error.message}`);
  return urlData.publicUrl;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description")
    .order("name");
  if (error) throw new Error(`getCategories failed: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("authors")
    .select("id, name, bio")
    .order("name");
  if (error) throw new Error(`getAuthors failed: ${error.message}`);
  return (data ?? []) as Author[];
}
