import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookById } from "@/services/bookService";
import { BookDetailClient } from "@/components/features/books/BookDetailClient";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  return { title: book ? `${book.title} | Library` : "Book" };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div>
      <Link
        href="/member/browse"
        className={cn(buttonVariants({ variant: "ghost" }), "mb-4 inline-flex")}
      >
        ← Back to browse
      </Link>
      <BookDetailClient book={book} />
    </div>
  );
}
