"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Book, Category } from "@/types";
import { BookSearch } from "./BookSearch";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookCard } from "./BookCard";

export function BrowseClient({
  initialBooks,
  totalCount,
  categories,
}: {
  initialBooks: Book[];
  totalCount: number;
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounced = useDebounce(search, 300);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debounced === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debounced) params.set("q", debounced);
    else params.delete("q");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/member/browse?${qs}` : "/member/browse");
    });
  }, [debounced, router, searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <BookSearch value={search} onChange={setSearch} />
        <div className="w-full space-y-2 sm:w-auto">
          <Label htmlFor="cat">Category</Label>
          <Select
            value={searchParams.get("category") ?? "all"}
            onValueChange={(v) => {
              if (!v) return;
              const params = new URLSearchParams(searchParams.toString());
              if (v === "all") params.delete("category");
              else params.set("category", v);
              router.push(`/member/browse?${params.toString()}`);
            }}
          >
            <SelectTrigger id="cat" className="h-11 w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="avail"
            checked={searchParams.get("available") === "true"}
            onCheckedChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              if (v) params.set("available", "true");
              else params.delete("available");
              router.push(`/member/browse?${params.toString()}`);
            }}
          />
          <Label htmlFor="avail" className="font-normal">
            Available only
          </Label>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {initialBooks.length === totalCount
          ? `${totalCount} book${totalCount === 1 ? "" : "s"}`
          : `${initialBooks.length} of ${totalCount} books`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            href={`/member/browse/${book.id}`}
          />
        ))}
      </div>
    </div>
  );
}
