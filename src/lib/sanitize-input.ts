import type { BookInput } from "@/lib/validations";

/** Turn empty strings into null for optional DB fields. */
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    const v = out[key as keyof T];
    if (v === "") {
      (out as Record<string, unknown>)[key] = null;
    }
  }
  return out;
}

export function sanitizeBookInput(
  input: Partial<BookInput>
): Partial<BookInput> & { cover_url?: string | null } {
  const { cover_base64, author_name: _authorName, ...rest } = input;
  const cleaned = emptyToNull(rest as Record<string, unknown>) as Partial<BookInput>;
  if (cleaned.isbn === null) delete cleaned.isbn;
  if (cleaned.subtitle === null) delete cleaned.subtitle;
  if (cleaned.description === null) delete cleaned.description;
  if (cleaned.shelf_number === null) delete cleaned.shelf_number;
  if (cleaned.rack_number === null) delete cleaned.rack_number;
  if (cleaned.edition === null) delete cleaned.edition;

  const out = cleaned as Partial<BookInput> & { cover_url?: string | null };
  if (cover_base64 === null) {
    out.cover_url = null;
  } else if (cover_base64) {
    out.cover_url = cover_base64;
  }
  return out;
}
