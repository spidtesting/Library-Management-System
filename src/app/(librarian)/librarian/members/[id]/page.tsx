import type { Metadata } from "next";
import { MemberDetailView } from "@/components/features/members/MemberDetailView";
import { getMemberById } from "@/services/memberService";
import { requirePortalRole } from "@/lib/portal-auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id, "librarian");
  return { title: member ? `${member.full_name} | Members` : "Member" };
}

export default async function LibrarianMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalRole(["librarian", "admin"]);
  const { id } = await params;

  return (
    <MemberDetailView
      id={id}
      viewerRole="librarian"
      listPath="/librarian/members"
      canDelete={false}
    />
  );
}
