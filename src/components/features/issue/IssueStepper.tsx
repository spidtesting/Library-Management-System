"use client";

import { useState, useEffect } from "react";
import type { Profile, Book } from "@/types";
import { MemberSelector } from "@/components/features/members/MemberSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/ui/section-card";
import { addDays, toDateInputValue } from "@/utils/formatDate";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function IssueStepper() {
  const [step, setStep] = useState(1);
  const [member, setMember] = useState<Profile | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [bookSearch, setBookSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        const days = s.max_borrow_days ?? 14;
        setDueDate(toDateInputValue(addDays(new Date(), days)));
      });
  }, []);

  useEffect(() => {
    if (bookSearch.length < 2) {
      setBooks([]);
      return;
    }
    fetch(`/api/books?search=${encodeURIComponent(bookSearch)}&availableOnly=true`)
      .then((r) => r.json())
      .then((d) => setBooks(d.data ?? []));
  }, [bookSearch]);

  async function submitIssue() {
    if (!member || !book) return;
    setLoading(true);
    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          book_id: book.id,
          due_date: dueDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Issue failed");
      setReceipt(data);
      setStep(4);
      toast.success("Book issued successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Issue failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setMember(null);
    setBook(null);
    setReceipt(null);
    setBookSearch("");
  }

  if (step === 4 && receipt) {
    return (
      <SectionCard
        title={
          <span className="inline-flex items-center gap-2 text-brand">
            <CheckCircle2 className="h-5 w-5" />
            Book issued
          </span>
        }
        accent="emerald"
        className="max-w-md mx-auto"
      >
        <div className="space-y-2 text-sm">
          <p>
            <strong>{book?.title}</strong> issued to <strong>{member?.full_name}</strong>
          </p>
          <p>Due: {dueDate}</p>
          <Button onClick={reset} className="w-full mt-4">
            Issue another book
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-full border border-brand/25 bg-brand/[0.06] px-3 py-1.5 text-center text-sm font-medium text-brand">
        Step {step} of 3
      </div>
      {step === 1 && (
        <>
          <MemberSelector selected={member} onSelect={setMember} />
          <Button
            className="w-full"
            disabled={!member}
            onClick={() => setStep(2)}
          >
            Next: Select book
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="book-search">Search book</Label>
            <Input
              id="book-search"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder="Title…"
            />
            <ul className="max-h-48 overflow-auto border rounded-md">
              {books.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => setBook(b)}
                  >
                    {b.title} ({b.available_copies} available)
                  </button>
                </li>
              ))}
            </ul>
            {book && <p className="text-sm">Selected: {book.title}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" disabled={!book} onClick={() => setStep(3)}>
              Next: Confirm
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <SectionCard title="Confirm issue" accent="emerald">
            <div className="space-y-2 text-sm">
              <p>Member: {member?.full_name}</p>
              <p>Book: {book?.title}</p>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>
          <IssueActions loading={loading} onBack={() => setStep(2)} onSubmit={submitIssue} />
        </>
      )}
    </div>
  );
}

function IssueActions({
  loading,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button className="flex-1" disabled={loading} onClick={onSubmit}>
        {loading ? "Issuing…" : "Confirm issue"}
      </Button>
    </div>
  );
}
