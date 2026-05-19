import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BookForm } from "@/components/features/books/BookForm";

export const metadata: Metadata = { title: "Add Book | Admin" };

export default function NewBookPage() {
  return (
    <div>
      <PageHeader title="Add book" />
      <BookForm />
    </div>
  );
}
