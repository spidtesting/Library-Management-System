import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { IssueStepper } from "@/components/features/issue/IssueStepper";

export const metadata: Metadata = { title: "Issue Book | Admin" };

export default function AdminIssuePage() {
  return (
    <div>
      <PageHeader title="Issue book" description="3-step checkout" />
      <IssueStepper />
    </div>
  );
}
