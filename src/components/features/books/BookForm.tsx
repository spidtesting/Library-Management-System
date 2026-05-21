"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookInput } from "@/lib/validations";
import { BookCoverPicker } from "@/components/features/books/BookCoverPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/ui/section-card";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";

export function BookForm({ listPath = "/admin/books" }: { listPath?: string }) {
  const router = useRouter();
  const [coverBase64, setCoverBase64] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      language: "English",
      total_copies: 1,
      status: "available" as const,
    },
  });

  const status = watch("status");

  async function onSubmit(values: BookInput) {
    const payload: BookInput = {
      ...values,
      ...(coverBase64 ? { cover_base64: coverBase64 } : {}),
    };

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseApiResponse<{ id?: string; error?: string }>(res);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create book");
      return;
    }
    if (!data.id) {
      toast.error("Book created but id missing in response");
      return;
    }
    toast.success("Book created");
    router.push(`${listPath}/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-6">
      <SectionCard title="Cover photo" accent="violet">
        <BookCoverPicker value={coverBase64} onChange={setCoverBase64} disabled={isSubmitting} />
      </SectionCard>

      <SectionCard title="Book details" accent="blue">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *" id="title" error={errors.title?.message} className="sm:col-span-2">
            <Input id="title" {...register("title")} />
          </Field>
          <Field label="Subtitle" id="subtitle" error={errors.subtitle?.message} className="sm:col-span-2">
            <Input id="subtitle" {...register("subtitle")} />
          </Field>
          <Field label="ISBN" id="isbn" error={errors.isbn?.message}>
            <Input id="isbn" {...register("isbn")} />
          </Field>
          <Field label="Language" id="language" error={errors.language?.message}>
            <Input id="language" {...register("language")} />
          </Field>
          <Field label="Edition" id="edition" error={errors.edition?.message}>
            <Input id="edition" {...register("edition")} />
          </Field>
          <Field label="Published year" id="published_year" error={errors.published_year?.message}>
            <Input
              id="published_year"
              type="number"
              min={1000}
              max={2100}
              {...register("published_year", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Description" id="description" className="sm:col-span-2">
            <Textarea id="description" rows={4} {...register("description")} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Copies & location" accent="emerald">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total copies *" id="total_copies" error={errors.total_copies?.message}>
            <Input
              id="total_copies"
              type="number"
              min={1}
              {...register("total_copies", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Status" id="status" error={errors.status?.message}>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as BookInput["status"])}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Shelf" id="shelf_number">
            <Input id="shelf_number" placeholder="e.g. A3" {...register("shelf_number")} />
          </Field>
          <Field label="Rack" id="rack_number">
            <Input id="rack_number" placeholder="e.g. R2" {...register("rack_number")} />
          </Field>
        </div>
      </SectionCard>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(listPath)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create book"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
  className,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
