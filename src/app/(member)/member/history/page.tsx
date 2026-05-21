import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getMemberHistory } from "@/services/memberService";
import { formatDate } from "@/utils/formatDate";
import { SectionCard } from "@/components/ui/section-card";
import { Badge } from "@/components/ui/badge";
import { borrowHistoryStatusBadgeClass } from "@/lib/status-badges";

export const metadata: Metadata = { title: "History | Member" };

export default async function MemberHistoryPage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  const history = await getMemberHistory(profile.id);

  return (
    <div>
      <PageHeader title="Borrowing history" />
      <SectionCard
        title="Your borrowing history"
        description="Past issues and returns"
        accent="violet"
      >
        <ul className="space-y-2 text-sm">
          {history.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-lg border border-violet-500/15 bg-violet-500/[0.03] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{b.book?.title}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {formatDate(b.issue_date)}
                  {b.returned_date && ` · returned ${formatDate(b.returned_date)}`}
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
            <p className="py-4 text-center text-muted-foreground">No borrowing history yet.</p>
          )}
        </ul>
      </SectionCard>
    </div>
  );
}
