"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Book } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addRecentlyViewed } from "./RecentlyViewed";
import { toast } from "sonner";
import { useState } from "react";
import { parseApiResponse } from "@/lib/parse-api-response";

export function BookDetailClient({ book }: { book: Book }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    addRecentlyViewed(book.id);
  }, [book.id]);

  async function reserve() {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error ?? "Reservation failed");
      toast.success("Reservation placed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {book.cover_url ? (
        <Image
          src={book.cover_url}
          alt={book.title}
          width={240}
          height={360}
          className="rounded-lg object-cover"
        />
      ) : (
        <div className="aspect-[2/3] max-w-xs rounded-lg bg-muted" />
      )}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        {book.author?.name && (
          <p className="text-muted-foreground">by {book.author.name}</p>
        )}
        <Badge>{book.available_copies > 0 ? "Available" : "Unavailable"}</Badge>
        {book.shelf_number && (
          <p className="text-sm">
            Shelf {book.shelf_number}
            {book.rack_number ? ` · Rack ${book.rack_number}` : ""}
          </p>
        )}
        <p className="text-sm">{book.description}</p>
        <Button
          disabled={book.available_copies < 1 || loading}
          onClick={reserve}
        >
          {loading ? "Reserving…" : "Reserve this book"}
        </Button>
      </div>
    </div>
  );
}
