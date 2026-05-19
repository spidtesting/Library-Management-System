"use client";

import { useState } from "react";
import type { Fine } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { parseApiResponse } from "@/lib/parse-api-response";

export function FinesClient({ fines: initial }: { fines: Fine[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("pending");
  const fines = initial.filter((f) => !status || f.status === status);

  async function handleAction(id: string, action: "pay" | "waive") {
    const res = await fetch(`/api/fines/${id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Action failed");
      return;
    }
    toast.success(action === "pay" ? "Fine marked paid" : "Fine waived");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={(v) => v && setStatus(v)}>
        <SelectTrigger className="w-40" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="waived">Waived</SelectItem>
        </SelectContent>
      </Select>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <caption className="sr-only">Fines</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines.map((fine) => (
              <TableRow key={fine.id}>
                <TableCell>{fine.member?.full_name}</TableCell>
                <TableCell>{fine.overdue_days}</TableCell>
                <TableCell>${Number(fine.total_amount).toFixed(2)}</TableCell>
                <TableCell>{fine.status}</TableCell>
                <TableCell>{formatDate(fine.created_at)}</TableCell>
                <TableCell className="space-x-2">
                  {fine.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleAction(fine.id, "pay")}>
                        Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(fine.id, "waive")}
                      >
                        Waive
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
