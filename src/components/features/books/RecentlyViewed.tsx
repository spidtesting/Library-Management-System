"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RECENTLY_VIEWED_KEY, RECENTLY_VIEWED_MAX } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids.slice(0, RECENTLY_VIEWED_MAX);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(bookId: string) {
  const ids = getRecentlyViewedIds().filter((id) => id !== bookId);
  ids.unshift(bookId);
  localStorage.setItem(
    RECENTLY_VIEWED_KEY,
    JSON.stringify(ids.slice(0, RECENTLY_VIEWED_MAX))
  );
}

export function RecentlyViewed({ className }: { className?: string }) {
  const [ids, setIds] = useState<string[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = getRecentlyViewedIds();
    setIds(stored);
    stored.forEach(async (id) => {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const book = await res.json();
        setTitles((t) => ({ ...t, [id]: book.title }));
      }
    });
  }, []);

  if (ids.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Recently viewed</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {ids.map((id) => (
            <li key={id}>
              <Link href={`/member/browse/${id}`} className="hover:text-brand">
                {titles[id] ?? id.slice(0, 8)}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
