"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Profile } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function MemberSelector({
  onSelect,
  selected,
}: {
  onSelect: (member: Profile) => void;
  selected: Profile | null;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(search, 300);

  useEffect(() => {
    async function fetchMembers() {
      if (debounced.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/members?search=${encodeURIComponent(debounced)}&pageSize=10`
        );
        const json = await res.json();
        if (!res.ok) {
          setResults([]);
          return;
        }
        setResults(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [debounced]);

  return (
    <div className="space-y-2">
      <Label htmlFor="member-search">Search member</Label>
      <Input
        id="member-search"
        placeholder="Name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {selected && (
        <p className="text-sm">
          Selected: <strong>{selected.full_name}</strong> ({selected.borrow_tokens_used}/
          {selected.borrow_token_limit} tokens)
        </p>
      )}
      {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
      <ul className="max-h-48 space-y-1 overflow-auto rounded-md border p-2">
        {results.map((member) => {
          const atLimit = member.borrow_tokens_used >= member.borrow_token_limit;
          const disabled = !member.is_active || atLimit;
          return (
            <li key={member.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(member)}
                className={cn(
                  "w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted",
                  disabled && "cursor-not-allowed opacity-50",
                  selected?.id === member.id && "bg-muted"
                )}
              >
                {member.full_name} — {member.email}
                {atLimit && " (at limit)"}
                {!member.is_active && " (inactive)"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
