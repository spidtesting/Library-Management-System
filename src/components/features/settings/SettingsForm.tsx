"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import type { LibrarySettings } from "@/types";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parseApiResponse } from "@/lib/parse-api-response";
import { formatDate } from "@/utils/formatDate";

export function SettingsForm({ settings }: { settings: LibrarySettings }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      library_name: settings.library_name,
      max_borrow_days: settings.max_borrow_days,
      fine_per_day: Number(settings.fine_per_day),
      max_borrow_tokens: settings.max_borrow_tokens,
      reservation_expiry_days: settings.reservation_expiry_days,
    },
  });

  async function onSubmit(values: SettingsInput) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <SectionCard
      title="Library policies"
      description="Borrow limits, fines, and reservation rules"
      accent="brand"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <Field label="Library name" id="library_name" error={errors.library_name?.message}>
        <Input id="library_name" {...register("library_name")} />
      </Field>
      <Field label="Max borrow days" id="max_borrow_days" error={errors.max_borrow_days?.message}>
        <Input id="max_borrow_days" type="number" {...register("max_borrow_days", { valueAsNumber: true })} />
      </Field>
      <Field label="Fine per day ($)" id="fine_per_day" error={errors.fine_per_day?.message}>
        <Input id="fine_per_day" type="number" step="0.01" {...register("fine_per_day", { valueAsNumber: true })} />
      </Field>
      <Field label="Max borrow tokens" id="max_borrow_tokens" error={errors.max_borrow_tokens?.message}>
        <Input id="max_borrow_tokens" type="number" {...register("max_borrow_tokens", { valueAsNumber: true })} />
      </Field>
      <Field
        label="Reservation expiry (days)"
        id="reservation_expiry_days"
        error={errors.reservation_expiry_days?.message}
      >
        <Input id="reservation_expiry_days" type="number" {...register("reservation_expiry_days", { valueAsNumber: true })} />
      </Field>
      <p className="text-xs text-muted-foreground">
        Last updated: {formatDate(settings.updated_at)}
      </p>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save settings"}
      </Button>
    </form>
    </SectionCard>
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
