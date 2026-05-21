import Link from "next/link";
import type { Book } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookCoverImage } from "@/components/features/books/BookCoverImage";
import { ResponsiveTableShell } from "@/components/ui/responsive-table-shell";
import { bookStatusBadgeClass } from "@/lib/status-badges";
import { cn } from "@/lib/utils";

export function BookTable({
  books,
  basePath = "/admin/books",
}: {
  books: Book[];
  basePath?: string;
}) {
  if (books.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No books found.</p>
    );
  }

  return (
    <ResponsiveTableShell>
      <Table>
        <caption className="sr-only">Books catalogue</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden sm:table-cell">Author</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow
              key={book.id}
              className={cn(
                book.available_copies === 0 && "bg-orange-500/[0.03] hover:bg-orange-500/[0.06]"
              )}
            >
              <TableCell>
                {book.cover_url ? (
                  <BookCoverImage
                    src={book.cover_url}
                    alt=""
                    width={40}
                    height={56}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="h-14 w-10 rounded bg-muted" />
                )}
              </TableCell>
              <TableCell>
                <Link href={`${basePath}/${book.id}`} className="font-medium hover:text-brand">
                  {book.title}
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{book.author?.name ?? "—"}</TableCell>
              <TableCell>
                {book.available_copies} / {book.total_copies}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    book.available_copies === 0
                      ? "destructive"
                      : book.status === "available"
                        ? "default"
                        : "secondary"
                  }
                  className={bookStatusBadgeClass(book)}
                >
                  {book.available_copies === 0 ? "Out of stock" : book.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableShell>
  );
}
