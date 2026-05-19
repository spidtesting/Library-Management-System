"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { Profile } from "@/types";
import { MemberTable } from "./MemberTable";
import { BookSearch } from "@/components/features/books/BookSearch";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function MembersClient({
  initialMembers,
  canDelete = false,
}: {
  initialMembers: Profile[];
  canDelete?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounced = useDebounce(search, 300);
  const [, startTransition] = useTransition();
  const [members, setMembers] = useState(initialMembers);

  const statusFilter = searchParams.get("status") ?? "all";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/admin/members?${qs}` : "/admin/members");
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debounced === current) return;
    updateParams({ search: debounced || null });
  }, [debounced, searchParams, updateParams]);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const filtered = members.filter((m) => {
    if (statusFilter === "active") return m.is_active;
    if (statusFilter === "blocked") return !m.is_active;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <BookSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
        />
        <div className="space-y-2">
          <Label htmlFor="member-status">Borrow access</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => v && updateParams({ status: v === "all" ? null : v })}
          >
            <SelectTrigger id="member-status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All members</SelectItem>
              <SelectItem value="active">Can borrow</SelectItem>
              <SelectItem value="blocked">Borrow blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <MemberTable
        members={filtered}
        canDelete={canDelete}
        onUpdated={() => router.refresh()}
      />
    </div>
  );
}
