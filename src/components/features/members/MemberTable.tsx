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
import { ResponsiveTableShell } from "@/components/ui/responsive-table-shell";
import { borrowAccessBadgeClass, formatRoleLabel, roleBadgeClass } from "@/lib/status-badges";
import { cn } from "@/lib/utils";

export function MemberTable({
  members,
  isLoading = false,
  canDelete = false,
  listPath = "/admin/members",
  showRole = false,
  onUpdated,
}: {
  members: Profile[];
  isLoading?: boolean;
  canDelete?: boolean;
  listPath?: string;
  showRole?: boolean;
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
      <p className="py-8 text-center text-muted-foreground">
        {showRole ? "No accounts found." : "No members found."}
      </p>
    );
  }

  async function toggleBorrowAccess(member: Profile) {
    if (member.role !== "member") return;
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
        `Delete ${member.full_name}? This permanently removes their login, profile, and borrow history.`
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
    <ResponsiveTableShell>
      <Table>
        <caption className="sr-only">Members list</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {showRole && <TableHead>Role</TableHead>}
            <TableHead className="hidden md:table-cell">NIC</TableHead>
            <TableHead className="hidden lg:table-cell">Email</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead>Borrow access</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => {
            const isLibraryMember = m.role === "member";
            return (
            <TableRow key={m.id}>
              <TableCell>
                <Link
                  href={`${listPath}/${m.id}`}
                  className="font-medium hover:text-brand"
                >
                  {m.full_name}
                </Link>
                <p className="truncate text-xs text-muted-foreground lg:hidden">{m.email}</p>
              </TableCell>
              {showRole && (
                <TableCell>
                  <Badge variant="outline" className={roleBadgeClass(m.role)}>
                    {formatRoleLabel(m.role)}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="hidden font-mono text-sm text-muted-foreground md:table-cell">
                {m.nic_number ?? "—"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{m.email}</TableCell>
              <TableCell>
                {isLibraryMember ? (
                  <>
                    {m.borrow_tokens_used}/{m.borrow_token_limit}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {isLibraryMember ? (
                  <Badge
                    variant={m.is_active ? "default" : "destructive"}
                    className={borrowAccessBadgeClass(m.is_active)}
                  >
                    {m.is_active ? "Can borrow" : "Blocked"}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Staff</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {isLibraryMember && (
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
                  )}
                  <Link
                    href={`${listPath}/${m.id}`}
                    title="Edit account"
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
          );
          })}
        </TableBody>
      </Table>
    </ResponsiveTableShell>
  );
}
