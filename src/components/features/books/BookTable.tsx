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
import Image from "next/image";

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
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <caption className="sr-only">Books catalogue</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                {book.cover_url ? (
                  <Image
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
              <TableCell>{book.author?.name ?? "—"}</TableCell>
              <TableCell>
                {book.available_copies} / {book.total_copies}
              </TableCell>
              <TableCell>
                <Badge variant={book.status === "available" ? "default" : "secondary"}>
                  {book.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
