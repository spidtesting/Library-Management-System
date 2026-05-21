"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberCreateSchema, type MemberCreateInput } from "@/lib/validations";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function MemberCreateDialog({ actorRole }: { actorRole: UserRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = actorRole === "admin";

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
      nic_number: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "member" as const,
      borrow_token_limit: 3,
      is_active: true,
    },
  });

  const selectedRole = watch("role") ?? "member";
  const isMemberRole = selectedRole === "member";

  async function onSubmit(values: MemberCreateInput) {
    const payload: MemberCreateInput = isAdmin
      ? values
      : { ...values, role: "member" };

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseApiResponse<{ id?: string; role?: string; error?: string }>(res);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create account");
      return;
    }
    const label =
      data.role === "librarian"
        ? "Librarian"
        : data.role === "admin"
          ? "Admin"
          : "Member";
    toast.success(`${label} account created`);
    setOpen(false);
    reset();
    router.refresh();
    if (data.id && data.role === "member") {
      router.push(`/admin/members/${data.id}`);
    }
  }

  return (
    <>
      <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        {isAdmin ? "Add account" : "Add member"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isAdmin ? "Add account" : "Add library member"}</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "Create a login for a member, librarian, or admin. Members can sign in with NIC or email."
                : "Creates a library member (member role only). They can sign in with NIC or email and the password you set."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isAdmin && (
              <Field label="Role" id="create-role" error={errors.role?.message}>
                <Select
                  value={selectedRole}
                  onValueChange={(v) =>
                    setValue("role", v as MemberCreateInput["role"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label="Full name" id="create-full_name" error={errors.full_name?.message}>
              <Input id="create-full_name" {...register("full_name")} />
            </Field>

            {isMemberRole && (
              <Field label="NIC number" id="create-nic_number" error={errors.nic_number?.message}>
                <Input
                  id="create-nic_number"
                  placeholder="951234567V"
                  autoComplete="off"
                  {...register("nic_number")}
                />
              </Field>
            )}

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

            {isMemberRole && (
              <>
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
              </>
            )}

            {isAdmin && !isMemberRole && (
              <p className="text-xs text-muted-foreground rounded-lg border bg-muted/30 p-3">
                {selectedRole === "librarian"
                  ? "Librarian accounts use the librarian portal and will not appear in the members list below."
                  : "Admin accounts have full access and will not appear in the members list below."}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : isAdmin ? "Create account" : "Create member"}
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
