import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFines } from "@/services/fineService";
import { FinesClient } from "@/components/features/fines/FinesClient";

export const metadata: Metadata = { title: "Fines | Admin" };

export default async function AdminFinesPage() {
  const { data: fines } = await getFines({ pageSize: 100 });

  return (
    <div>
      <PageHeader title="Fines" description="Manage overdue fines" />
      <FinesClient fines={fines} />
    </div>
  );
}
