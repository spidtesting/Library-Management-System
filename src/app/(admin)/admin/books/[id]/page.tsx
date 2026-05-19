import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBookById } from "@/services/bookService";
import { BookEditForm } from "@/components/features/books/BookEditForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  return { title: book ? `Edit: ${book.title}` : "Book" };
}

export default async function AdminBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div>
      <PageHeader
        title={book.title}
        description="Edit book details and cover"
        action={
          <Link href="/admin/books" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to list
          </Link>
        }
      />
      <BookEditForm book={book} listPath="/admin/books" canDelete />
    </div>
  );
}
