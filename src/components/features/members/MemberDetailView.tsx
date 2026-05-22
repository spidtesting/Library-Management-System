import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMemberById,
  getMemberActiveBorrows,
  getMemberHistory,
  getMemberPendingFinesTotal,
} from "@/services/memberService";
import { MemberCard } from "@/components/features/members/MemberCard";
import { MemberEditForm } from "@/components/features/members/MemberEditForm";
import { formatDate } from "@/utils/formatDate";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { borrowHistoryStatusBadgeClass } from "@/lib/status-badges";
import type { UserRole } from "@/types";

export async function MemberDetailView({
  id,
  viewerRole,
  listPath,
  canDelete,
}: {
  id: string;
  viewerRole: UserRole;
  listPath: string;
  canDelete: boolean;
}) {
  const member = await getMemberById(id, viewerRole);
  if (!member) notFound();

  const isLibraryMember = member.role === "member";

  const [active, history, finesTotal] = isLibraryMember
    ? await Promise.all([
        getMemberActiveBorrows(id),
        getMemberHistory(id),
        getMemberPendingFinesTotal(id),
      ])
    : [[], [], 0];

  return (
    <div>
      <PageHeader
        title={member.full_name}
        description={
          isLibraryMember
            ? "Member profile, borrows, and account settings"
            : "Staff account details"
        }
        action={
          <Link href={listPath} className={cn(buttonVariants({ variant: "outline" }))}>
            Back to list
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <MemberCard member={member} pendingFines={finesTotal} />
          <SectionCard
            title={isLibraryMember ? "Edit member" : "Edit account"}
            accent="blue"
          >
            <MemberEditForm
              member={member}
              canDelete={canDelete}
              listPath={listPath}
            />
          </SectionCard>
        </div>
        {isLibraryMember ? (
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
                  <span className="text-muted-foreground">
                    {" "}
                    — due {formatDate(b.due_date)}
                  </span>
                </li>
              ))}
              {active.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">No active borrows</p>
              )}
            </ul>
          </SectionCard>
        ) : (
          <SectionCard
            title="Library access"
            accent="emerald"
            className="lg:col-span-2"
          >
            <p className="text-sm text-muted-foreground">
              This account is a {member.role}. Staff use the {member.role} portal to manage
              books and members; borrow limits do not apply.
            </p>
          </SectionCard>
        )}
      </div>
      {isLibraryMember && (
        <SectionCard title="Borrow history" accent="violet" className="mt-6">
          <ul className="space-y-2 text-sm">
            {history.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-2 rounded-lg border border-violet-500/15 bg-violet-500/[0.03] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">{b.book?.title}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">{formatDate(b.issue_date)}</span>
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
      )}
    </div>
  );
}
