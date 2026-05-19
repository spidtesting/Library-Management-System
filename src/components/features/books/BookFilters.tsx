"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

export function BookFilters({
  categories,
  categoryId,
  availableOnly,
  onCategoryChange,
  onAvailableChange,
}: {
  categories: Category[];
  categoryId: string | null;
  availableOnly: boolean;
  onCategoryChange: (categoryId: string | null) => void;
  onAvailableChange: (available: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="category-filter">Category</Label>
        <Select
          value={categoryId ?? "all"}
          onValueChange={(v) => {
            if (!v || v === "all") onCategoryChange(null);
            else onCategoryChange(v);
          }}
        >
          <SelectTrigger id="category-filter" className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 pb-2">
        <Checkbox
          id="available-filter"
          checked={availableOnly}
          onCheckedChange={(v) => onAvailableChange(v === true)}
        />
        <Label htmlFor="available-filter" className="font-normal">
          Available only
        </Label>
      </div>
    </div>
  );
}
