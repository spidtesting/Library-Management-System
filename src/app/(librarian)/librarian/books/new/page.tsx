import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookForm } from "@/components/features/books/BookForm";
import { getAuthors, getCategories } from "@/services/bookService";

export const metadata: Metadata = { title: "Add Book | Librarian" };

export default async function LibrarianNewBookPage() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthors()]);

  return (
    <div>
      <PageHeader title="Add book" />
      <BookForm
        listPath="/librarian/books"
        categories={categories}
        authors={authors}
      />
    </div>
  );
}
