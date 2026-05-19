"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";
import { Pencil, Trash2, BookCheck, BookX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MemberTable({
  members,
  isLoading = false,
  canDelete = false,
  onUpdated,
}: {
  members: Profile[];
  isLoading?: boolean;
  canDelete?: boolean;
  onUpdated?: () => void;
}) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No members found.</p>
    );
  }

  async function toggleBorrowAccess(member: Profile) {
    const next = !member.is_active;
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, is_active: next }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success(next ? "Member can borrow books" : "Borrow access blocked");
    onUpdated?.();
    router.refresh();
  }

  async function deleteMember(member: Profile) {
    if (
      !confirm(
        `Delete ${member.full_name}? This removes their login and profile permanently.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Delete failed");
      return;
    }
    toast.success("Member deleted");
    onUpdated?.();
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <caption className="sr-only">Members list</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead>Borrow access</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <Link
                  href={`/admin/members/${m.id}`}
                  className="font-medium hover:text-brand"
                >
                  {m.full_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{m.email}</TableCell>
              <TableCell>
                {m.borrow_tokens_used}/{m.borrow_token_limit}
              </TableCell>
              <TableCell>
                <Badge variant={m.is_active ? "default" : "destructive"}>
                  {m.is_active ? "Can borrow" : "Blocked"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    title={m.is_active ? "Block borrowing" : "Allow borrowing"}
                    onClick={() => toggleBorrowAccess(m)}
                  >
                    {m.is_active ? (
                      <BookX className="h-4 w-4" />
                    ) : (
                      <BookCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Link
                    href={`/admin/members/${m.id}`}
                    title="Edit member"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {canDelete && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      title="Delete member"
                      onClick={() => deleteMember(m)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
