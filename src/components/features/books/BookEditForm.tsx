"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, type BookInput } from "@/lib/validations";
import type { Author, Book, Category } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCoverPicker } from "@/components/features/books/BookCoverPicker";
import { BookCoverImage } from "@/components/features/books/BookCoverImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/ui/section-card";
import { toast } from "sonner";
import { useState } from "react";
import { parseApiResponse } from "@/lib/parse-api-response";
import { isCoverDataUrl } from "@/lib/cover-image";

export function BookEditForm({
  book,
  categories,
  authors = [],
  listPath = "/admin/books",
  canDelete = false,
}: {
  book: Book;
  categories: Category[];
  authors?: Author[];
  listPath?: string;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const initialCover = book.cover_url && isCoverDataUrl(book.cover_url) ? book.cover_url : null;
  const [coverBase64, setCoverBase64] = useState<string | null>(initialCover);
  const [coverDirty, setCoverDirty] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title,
      subtitle: book.subtitle ?? "",
      isbn: book.isbn ?? "",
      description: book.description ?? "",
      author_name: book.author?.name ?? "",
      category_id: book.category_id,
      language: book.language,
      total_copies: book.total_copies,
      shelf_number: book.shelf_number ?? "",
      rack_number: book.rack_number ?? "",
      status: book.status === "unavailable" ? "unavailable" : "available",
    },
  });

  const categoryId = watch("category_id");

  const previewUrl = coverDirty ? coverBase64 : book.cover_url;

  async function onSubmit(values: BookInput) {
    const payload: BookInput & { cover_base64?: string | null } = { ...values };
    if (coverDirty) {
      payload.cover_base64 = coverBase64;
    }

    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }
    toast.success("Book updated");
    router.refresh();
  }

  function onCoverChange(next: string | null) {
    setCoverBase64(next);
    setCoverDirty(true);
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
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Cover photo" accent="violet">
        <div className="space-y-4">
          {previewUrl ? (
            <BookCoverImage
              src={previewUrl}
              alt={book.title}
              width={200}
              height={280}
              className="mx-auto rounded-lg object-cover"
            />
          ) : (
            <div className="mx-auto flex h-[280px] w-[200px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              No cover
            </div>
          )}
          <BookCoverPicker
            value={coverDirty ? coverBase64 : coverBase64}
            onChange={onCoverChange}
            disabled={isSubmitting}
          />
          {book.cover_url && !isCoverDataUrl(book.cover_url) && !coverDirty && (
            <p className="text-xs text-muted-foreground">
              This book has a storage URL cover. Upload or take a new photo to replace it with a saved base64 image.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Edit details" accent="blue">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Title" id="title" error={errors.title?.message}>
              <Input id="title" {...register("title")} />
            </Field>
            <Field label="Author *" id="author_name" error={errors.author_name?.message}>
              <Input
                id="author_name"
                list="book-edit-author-suggestions"
                placeholder="e.g. Jane Austen"
                autoComplete="off"
                {...register("author_name")}
              />
              <datalist id="book-edit-author-suggestions">
                {authors.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Category" id="category_id" error={errors.category_id?.message}>
              <Select
                value={categoryId ?? "none"}
                onValueChange={(v) =>
                  setValue("category_id", v === "none" ? null : v, { shouldValidate: true })
                }
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      </SectionCard>
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
