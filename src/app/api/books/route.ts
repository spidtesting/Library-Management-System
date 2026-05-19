import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { bookSchema } from "@/lib/validations";
import { getBooks, createBook } from "@/services/bookService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getBooks({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      availableOnly: searchParams.get("availableOnly") === "true",
    });
    return apiSuccess(result);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const book = await createBook(parsed.data);
    revalidatePath("/admin/books");
    revalidatePath("/librarian/books");
    revalidatePath("/member/browse");
    return apiSuccess(book, 201);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
