import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CATALOGUE_PAGE_SIZE } from "@/lib/constants";
import { getBooks, getCategories } from "@/services/bookService";
import { BooksClient } from "@/components/features/books/BooksClient";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Books | Admin" };
export const revalidate = 60;

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    availableOnly?: string;
  }>;
}) {
  const params = await searchParams;
  const [booksResult, categories] = await Promise.all([
    getBooks({
      search: params.search,
      categoryId: params.categoryId,
      availableOnly: params.availableOnly === "true",
      pageSize: CATALOGUE_PAGE_SIZE,
    }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Books"
        description="Manage catalogue"
        action={
          <Link href="/admin/books/new" className={cn(buttonVariants())}>
            Add book
          </Link>
        }
      />
      <Suspense fallback={<p>Loading…</p>}>
        <BooksClient
          initialBooks={booksResult.data}
          totalCount={booksResult.count}
          categories={categories}
          basePath="/admin/books"
        />
      </Suspense>
    </div>
  );
}
