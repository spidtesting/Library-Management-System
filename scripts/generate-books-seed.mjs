/**
 * Generate supabase/seed-books.sql from Books.xlsx (via npx xlsx-cli).
 * Usage: node scripts/generate-books-seed.mjs [path-to.xlsx]
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const xlsxPath =
  process.argv[2] ??
  "/Users/ridmashehan/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/FCA41B00-8EB5-4267-8D5F-85E158849756/Books.xlsx";

function esc(s) {
  if (s == null) return "";
  return String(s)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, "''");
}

function normalizeIsbn(v) {
  const t = esc(v).replace(/[^0-9Xx]/g, "");
  if (!t || t.length < 10) return null;
  return t.toUpperCase();
}

function mapStatus(v) {
  const s = esc(v).toLowerCase();
  return s === "available" || s === "" ? "available" : "unavailable";
}

function guessLanguage(title) {
  const t = String(title ?? "");
  const ascii = (t.match(/[A-Za-z]/g) ?? []).length;
  return ascii > t.length / 2 ? "English" : "Sinhala";
}

const json = execSync(`npx --yes xlsx-cli -j "${xlsxPath}"`, {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
// xlsx-cli prints sheet name on stderr; stdout is JSON array only
const rows = JSON.parse(json.trim());

const books = [];
const seenIsbn = new Set();
for (const row of rows) {
  const title = esc(row.Title);
  if (!title) continue;
  const author = esc(row.Author) || "Unknown Author";
  const category = esc(row.Category) || "General";
  let isbn = normalizeIsbn(row.ISBN);
  // Spreadsheet reuses ISBNs for different titles — keep first, import rest without ISBN
  if (isbn && seenIsbn.has(isbn)) isbn = null;
  else if (isbn) seenIsbn.add(isbn);
  books.push({
    book_id: String(row.BookID ?? "").trim(),
    title,
    author,
    isbn,
    category,
    status: mapStatus(row.Status),
    language: guessLanguage(title),
  });
}

const categories = [...new Set(books.map((b) => b.category))].sort();
const authors = [...new Set(books.map((b) => b.author))].sort();

const lines = [];
lines.push(`-- Bulk import books from Books.xlsx (${books.length} titles)`);
lines.push(`-- Generated: ${new Date().toISOString().slice(0, 10)}`);
lines.push(`-- Run in Supabase Dashboard → SQL Editor (paste ALL, then Run once)`);
lines.push(`-- Prerequisites: library_schema.sql applied`);
lines.push(`-- Safe to re-run: skips duplicate ISBNs and same title+author.`);
lines.push(`-- Note: No TEMP tables — Supabase splits statements and would drop them.`);
lines.push("");

lines.push("-- Categories from spreadsheet");
for (const name of categories) {
  lines.push(
    `INSERT INTO categories (name, description) VALUES ('${esc(name)}', 'Imported from Books.xlsx') ON CONFLICT (name) DO NOTHING;`
  );
}
lines.push("");

lines.push("-- Authors from spreadsheet");
for (const name of authors) {
  lines.push(
    `INSERT INTO authors (name) VALUES ('${esc(name)}') ON CONFLICT (name) DO NOTHING;`
  );
}
lines.push("");

const valueLines = books.map((b) => {
  const isbnSql = b.isbn ? `'${esc(b.isbn)}'` : "NULL";
  return `  ('${esc(b.book_id)}', '${esc(b.title)}', '${esc(b.author)}', ${isbnSql}, '${esc(b.category)}', '${b.status}'::book_status, '${esc(b.language)}')`;
});

lines.push(`-- Import books (single statement — required for Supabase SQL Editor)`);
lines.push(`WITH books_import (legacy_book_id, title, author_name, isbn, category_name, book_status, language) AS (`);
lines.push("  VALUES");
lines.push(valueLines.join(",\n"));
lines.push(`)
INSERT INTO books (
  title, isbn, author_id, category_id, language,
  total_copies, available_copies, status, tags
)
SELECT
  bi.title,
  bi.isbn,
  a.id,
  c.id,
  bi.language,
  1,
  1,
  bi.book_status,
  ARRAY['legacy_book_id:' || bi.legacy_book_id]
FROM books_import bi
JOIN authors a ON a.name = bi.author_name
JOIN categories c ON c.name = bi.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM books b
  WHERE b.deleted_at IS NULL
    AND lower(b.title) = lower(bi.title)
    AND b.author_id = a.id
)
AND (
  bi.isbn IS NULL
  OR NOT EXISTS (
    SELECT 1 FROM books b
    WHERE b.deleted_at IS NULL AND b.isbn = bi.isbn
  )
)
ON CONFLICT (isbn) DO NOTHING;`);
lines.push("");
lines.push("SELECT count(*) AS total_books FROM books WHERE deleted_at IS NULL;");
lines.push(
  "SELECT count(*) AS imported_with_legacy_tag FROM books WHERE deleted_at IS NULL AND EXISTS (SELECT 1 FROM unnest(tags) t WHERE t LIKE 'legacy_book_id:%');"
);

const outPath = resolve(root, "supabase/seed-books.sql");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${books.length} books → ${outPath}`);
console.log(`Categories: ${categories.length}, Authors: ${authors.length}`);
