import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBooks, getCategories } from "@/services/bookService";
import { BooksClient } from "@/components/features/books/BooksClient";

export const metadata: Metadata = { title: "Books | Librarian" };
export const revalidate = 60;

export default async function LibrarianBooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    availableOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const [{ data: books }, categories] = await Promise.all([
    getBooks({
      search: params.search,
      categoryId: params.categoryId,
      availableOnly: params.availableOnly === "true",
    }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Books"
        description="Catalogue"
        action={
          <Link href="/librarian/books/new" className={cn(buttonVariants())}>
            Add book
          </Link>
        }
      />
      <Suspense fallback={<p>Loading…</p>}>
        <BooksClient
          initialBooks={books}
          categories={categories}
          basePath="/librarian/books"
        />
      </Suspense>
    </div>
  );
}
