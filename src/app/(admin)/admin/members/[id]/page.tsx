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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Card>
            <CardHeader>
              <CardTitle>Edit member</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberEditForm member={member} canDelete={canDelete} />
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active borrows</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {active.map((b) => (
                <li key={b.id}>
                  {b.book?.title} — due {formatDate(b.due_date)}
                </li>
              ))}
              {active.length === 0 && (
                <p className="text-muted-foreground">No active borrows</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Borrow history</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {history.map((b) => (
              <li key={b.id}>
                {b.book?.title} — {formatDate(b.issue_date)} ({b.status})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
