import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getMemberById,
  getMemberActiveBorrows,
  getMemberHistory,
  getMemberPendingFinesTotal,
} from "@/services/memberService";
import { MemberCard } from "@/components/features/members/MemberCard";
import { MemberEditForm } from "@/components/features/members/MemberEditForm";
import { requirePortalRole } from "@/lib/portal-auth";
import { formatDate } from "@/utils/formatDate";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { borrowHistoryStatusBadgeClass } from "@/lib/status-badges";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  return { title: member ? `${member.full_name} | Members` : "Member" };
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePortalRole(["admin", "librarian"]);
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) notFound();
  const canDelete = profile.role === "admin";

  const [active, history, finesTotal] = await Promise.all([
    getMemberActiveBorrows(id),
    getMemberHistory(id),
    getMemberPendingFinesTotal(id),
  ]);

  return (
    <div>
      <PageHeader title={member.full_name} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <MemberCard member={member} pendingFines={finesTotal} />
          <SectionCard title="Edit member" accent="blue">
            <MemberEditForm member={member} canDelete={canDelete} />
          </SectionCard>
        </div>
        <SectionCard
          title="Active borrows"
          accent="emerald"
          className="lg:col-span-2"
        >
          <ul className="space-y-2 text-sm">
            {active.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-2"
              >
                <span className="font-medium">{b.book?.title}</span>
                <span className="text-muted-foreground"> — due {formatDate(b.due_date)}</span>
              </li>
            ))}
            {active.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">No active borrows</p>
            )}
          </ul>
        </SectionCard>
      </div>
      <SectionCard title="Borrow history" accent="violet" className="mt-6">
        <ul className="space-y-2 text-sm">
          {history.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-lg border border-violet-500/15 bg-violet-500/[0.03] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{b.book?.title}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">
                  {formatDate(b.issue_date)}
                </span>
                <Badge
                  variant={b.status === "returned" ? "secondary" : "outline"}
                  className={borrowHistoryStatusBadgeClass(b.status)}
                >
                  {b.status}
                </Badge>
              </div>
            </li>
          ))}
          {history.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">No borrow history yet.</p>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}
