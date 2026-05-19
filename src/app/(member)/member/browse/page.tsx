import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseSkeleton } from "@/components/layout/PageSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBooks, getCategories } from "@/services/bookService";
import { BrowseClient } from "@/components/features/books/BrowseClient";

export const metadata: Metadata = { title: "Browse | Library" };
export const revalidate = 60;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; available?: string }>;
}) {
  const params = await searchParams;
  const [{ data: books }, categories] = await Promise.all([
    getBooks({
      search: params.q,
      categoryId: params.category,
      availableOnly: params.available === "true",
      pageSize: 24,
    }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader title="Browse books" description="Search and reserve titles" />
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseClient initialBooks={books} categories={categories} />
      </Suspense>
    </div>
  );
}
