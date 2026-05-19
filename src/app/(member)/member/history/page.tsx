import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getMemberHistory } from "@/services/memberService";
import { formatDate } from "@/utils/formatDate";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "History | Member" };

export default async function MemberHistoryPage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  const history = await getMemberHistory(profile.id);

  return (
    <div>
      <PageHeader title="Borrowing history" />
      <Card>
        <CardContent className="pt-6">
          <ul className="space-y-3 text-sm">
            {history.map((b) => (
              <li key={b.id} className="flex justify-between border-b pb-2">
                <span>{b.book?.title}</span>
                <span className="text-muted-foreground">
                  {formatDate(b.issue_date)} — {b.status}
                  {b.returned_date && ` · returned ${formatDate(b.returned_date)}`}
                </span>
              </li>
            ))}
            {history.length === 0 && (
              <p className="text-muted-foreground">No borrowing history yet.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
