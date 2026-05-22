import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getMembers } from "@/services/memberService";
import { MembersClient } from "@/components/features/members/MembersClient";
import { MemberCreateDialog } from "@/components/features/members/MemberCreateDialog";
import { requirePortalRole } from "@/lib/portal-auth";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Members | Librarian" };

export default async function LibrarianMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const profile = await requirePortalRole(["librarian", "admin"]);
  const params = await searchParams;

  let { data: members } = await getMembers({
    pageSize: 100,
    search: params.search,
    viewerRole: "librarian",
  });

  if (params.status === "active") {
    members = members.filter((m) => m.is_active);
  } else if (params.status === "blocked") {
    members = members.filter((m) => !m.is_active);
  }

  return (
    <div>
      <PageHeader
        title="Members"
        description="Library members who can borrow books"
        action={<MemberCreateDialog actorRole={profile.role} />}
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <MembersClient
          initialMembers={members}
          canDelete={false}
          viewerRole="librarian"
          listPath="/librarian/members"
        />
      </Suspense>
    </div>
  );
}
