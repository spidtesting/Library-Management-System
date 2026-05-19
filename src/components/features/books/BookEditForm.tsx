"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { bookSchema, type BookInput } from "@/lib/validations";
import type { Book } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE_BYTES } from "@/lib/constants";
import { useState } from "react";
import { parseApiResponse } from "@/lib/parse-api-response";

export function BookEditForm({
  book,
  listPath = "/admin/books",
  canDelete = false,
}: {
  book: Book;
  listPath?: string;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title,
      subtitle: book.subtitle ?? "",
      isbn: book.isbn ?? "",
      description: book.description ?? "",
      language: book.language,
      total_copies: book.total_copies,
      shelf_number: book.shelf_number ?? "",
      rack_number: book.rack_number ?? "",
      status: book.status === "unavailable" ? "unavailable" : "available",
    },
  });

  async function onSubmit(values: BookInput) {
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("Book updated");
    router.refresh();
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      toast.error("Invalid file type");
      return;
    }
    if (file.size > MAX_COVER_SIZE_BYTES) {
      toast.error("File too large (max 2MB)");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("cover", file);
      const res = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        body: form,
      });
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      toast.success("Cover uploaded");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Soft-delete this book?")) return;
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Delete failed");
      return;
    }
    toast.success("Book deleted");
    router.push(listPath);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            width={200}
            height={280}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="h-70 w-50 rounded-lg bg-muted" />
        )}
        <div className="space-y-2">
          <Label htmlFor="cover">Cover image</Label>
          <Input
            id="cover"
            type="file"
            accept={ALLOWED_COVER_TYPES.join(",")}
            onChange={onCoverChange}
            disabled={uploading}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Title" id="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <Field label="ISBN" id="isbn">
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
        <p className="text-sm text-muted-foreground">
          Available: {book.available_copies} copies
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
          {canDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
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
