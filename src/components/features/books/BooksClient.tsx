"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { BookSearch } from "./BookSearch";
import { BookFilters } from "./BookFilters";
import type { Book, Category } from "@/types";
import { BookTable } from "./BookTable";
import { useDebounce } from "@/hooks/useDebounce";

export function BooksClient({
  initialBooks,
  categories,
  basePath,
}: {
  initialBooks: Book[];
  categories: Category[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounced = useDebounce(search, 300);
  const [, startTransition] = useTransition();
  const [books, setBooks] = useState(initialBooks);

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debounced === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debounced) params.set("search", debounced);
    else params.delete("search");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${basePath}?${qs}` : basePath);
    });
  }, [debounced, searchParams, basePath, router]);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <BookSearch value={search} onChange={setSearch} />
        <BookFilters
          categories={categories}
          categoryId={searchParams.get("categoryId")}
          availableOnly={searchParams.get("availableOnly") === "true"}
          onCategoryChange={(id) => updateParams({ categoryId: id })}
          onAvailableChange={(v) =>
            updateParams({ availableOnly: v ? "true" : null })
          }
        />
      </div>
      <BookTable books={books} basePath={basePath} />
    </div>
  );
}
