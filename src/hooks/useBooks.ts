"use client";

import useSWR from "swr";
import type { Book, PaginatedResponse } from "@/types";

async function fetchBooks(url: string): Promise<PaginatedResponse<Book>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export function useBooks(params?: {
  page?: number;
  search?: string;
  categoryId?: string;
  availableOnly?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.availableOnly) query.set("availableOnly", "true");

  const key = `/api/books?${query.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetchBooks);

  return {
    books: data?.data ?? [],
    pagination: data,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
