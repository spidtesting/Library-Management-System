import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { IssueStepper } from "@/components/features/issue/IssueStepper";

export const metadata: Metadata = { title: "Issue Book | Librarian" };

export default function LibrarianIssuePage() {
  return (
    <div>
      <PageHeader title="Issue book" description="3-step checkout" />
      <IssueStepper />
    </div>
  );
}
