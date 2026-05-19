"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";

export function BookForm({ listPath = "/admin/books" }: { listPath?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: { language: "English", total_copies: 1, status: "available" as const },
  });

  async function onSubmit(values: BookInput) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <Field label="Title" id="title" error={errors.title?.message}>
        <Input id="title" {...register("title")} />
      </Field>
      <Field label="ISBN" id="isbn" error={errors.isbn?.message}>
        <Input id="isbn" {...register("isbn")} />
      </Field>
      <Field label="Description" id="description">
        <Textarea id="description" {...register("description")} />
      </Field>
      <Field label="Total copies" id="total_copies" error={errors.total_copies?.message}>
        <Input
          id="total_copies"
          type="number"
          min={1}
          {...register("total_copies", { valueAsNumber: true })}
        />
      </Field>
      <Field label="Shelf" id="shelf_number">
        <Input id="shelf_number" {...register("shelf_number")} />
      </Field>
      <Field label="Rack" id="rack_number">
        <Input id="rack_number" {...register("rack_number")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create book"}
      </Button>
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
