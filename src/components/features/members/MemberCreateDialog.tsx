"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberCreateSchema, type MemberCreateInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";
import { UserPlus } from "lucide-react";

export function MemberCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      borrow_token_limit: 3,
      is_active: true,
    },
  });

  async function onSubmit(values: MemberCreateInput) {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await parseApiResponse<{ id?: string; error?: string }>(res);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create member");
      return;
    }
    toast.success("Member created");
    setOpen(false);
    reset();
    router.refresh();
    if (data.id) {
      router.push(`/admin/members/${data.id}`);
    }
  }

  return (
    <>
      <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Add member
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add library member</DialogTitle>
          <DialogDescription>
            Creates a login account and member profile. They can sign in with this email and password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Full name" id="create-full_name" error={errors.full_name?.message}>
            <Input id="create-full_name" {...register("full_name")} />
          </Field>
          <Field label="Email" id="create-email" error={errors.email?.message}>
            <Input id="create-email" type="email" autoComplete="off" {...register("email")} />
          </Field>
          <Field label="Temporary password" id="create-password" error={errors.password?.message}>
            <Input
              id="create-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </Field>
          <Field label="Phone" id="create-phone">
            <Input id="create-phone" type="tel" {...register("phone")} />
          </Field>
          <Field label="Address" id="create-address">
            <Input id="create-address" {...register("address")} />
          </Field>
          <Field
            label="Max books at once"
            id="create-borrow_token_limit"
            error={errors.borrow_token_limit?.message}
          >
            <Input
              id="create-borrow_token_limit"
              type="number"
              min={1}
              max={20}
              {...register("borrow_token_limit", { valueAsNumber: true })}
            />
          </Field>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="create-is_active"
                checked={watch("is_active")}
                onCheckedChange={(v) => setValue("is_active", v === true)}
              />
              <div>
                <Label htmlFor="create-is_active" className="font-normal cursor-pointer">
                  Can borrow books
                </Label>
                <p className="text-xs text-muted-foreground">
                  Uncheck to block issuing and reservations until re-enabled.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create member"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
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
