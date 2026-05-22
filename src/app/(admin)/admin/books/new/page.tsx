import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookForm } from "@/components/features/books/BookForm";
import { getAuthors, getCategories } from "@/services/bookService";

export const metadata: Metadata = { title: "Add Book | Admin" };

export default async function NewBookPage() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthors()]);

  return (
    <div>
      <PageHeader
        title="Add book"
        description="Upload or capture a cover (max 2MB, saved as base64). Fill in details and create the catalogue entry."
      />
      <BookForm categories={categories} authors={authors} />
    </div>
  );
}
