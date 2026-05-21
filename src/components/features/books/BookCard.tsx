import Link from "next/link";
import type { Book } from "@/types";
import { BookCoverImage } from "@/components/features/books/BookCoverImage";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BookCard({
  book,
  href,
  className,
}: {
  book: Book;
  href: string;
  className?: string;
}) {
  const available = book.available_copies > 0;

  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
          {book.cover_url ? (
            <BookCoverImage
              src={book.cover_url}
              alt=""
              width={240}
              height={320}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
              <span className="text-xs">No cover</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-brand">
            {book.title}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {book.author?.name ?? "Unknown author"}
          </p>
          <Badge
            className="mt-2 w-fit"
            variant={available ? "default" : "secondary"}
          >
            {available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
