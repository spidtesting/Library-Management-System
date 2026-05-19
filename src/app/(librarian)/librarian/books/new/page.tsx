import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookForm } from "@/components/features/books/BookForm";

export const metadata: Metadata = { title: "Add Book | Librarian" };

export default function LibrarianNewBookPage() {
  return (
    <div>
      <PageHeader title="Add book" />
      <BookForm listPath="/librarian/books" />
    </div>
  );
}
