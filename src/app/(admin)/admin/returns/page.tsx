import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getActiveBorrows } from "@/services/returnService";
import { getSettings } from "@/services/settingsService";
import { ReturnsClient } from "@/components/features/returns/ReturnsClient";

export const metadata: Metadata = { title: "Returns | Admin" };

export default async function AdminReturnsPage() {
  const [borrows, settings] = await Promise.all([
    getActiveBorrows(),
    getSettings(),
  ]);

  return (
    <div>
      <PageHeader title="Returns" description="Process book returns" />
      <ReturnsClient borrows={borrows} fineRate={Number(settings.fine_per_day)} />
    </div>
  );
}
