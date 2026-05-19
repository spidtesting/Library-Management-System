"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberUpdateSchema, type MemberUpdateInput } from "@/lib/validations";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";

export function MemberEditForm({
  member,
  canDelete = false,
}: {
  member: Profile;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      full_name: member.full_name,
      phone: member.phone ?? "",
      address: member.address ?? "",
      borrow_token_limit: member.borrow_token_limit,
      is_active: member.is_active,
    },
  });

  async function onSubmit(values: MemberUpdateInput) {
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, ...values }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("Member updated");
    router.refresh();
  }

  async function onDelete() {
    if (
      !confirm(
        `Delete ${member.full_name}? This permanently removes their account.`
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
    router.push("/admin/members");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={member.email} disabled className="bg-muted" />
      </div>
      <Field label="Full name" id="full_name" error={errors.full_name?.message}>
        <Input id="full_name" {...register("full_name")} />
      </Field>
      <Field label="Phone" id="phone">
        <Input id="phone" type="tel" {...register("phone")} />
      </Field>
      <Field label="Address" id="address">
        <Input id="address" {...register("address")} />
      </Field>
      <Field
        label="Max books at once"
        id="borrow_token_limit"
        error={errors.borrow_token_limit?.message}
      >
        <Input
          id="borrow_token_limit"
          type="number"
          min={1}
          max={20}
          {...register("borrow_token_limit", { valueAsNumber: true })}
        />
      </Field>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(v) => setValue("is_active", v === true)}
          />
          <div>
            <Label htmlFor="is_active" className="font-normal cursor-pointer">
              Can borrow books
            </Label>
            <p className="text-xs text-muted-foreground">
              When off, librarians cannot issue books to this member and they cannot reserve titles.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        {canDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete member
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
