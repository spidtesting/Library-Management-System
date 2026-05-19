import type { Metadata } from "next";
import { requirePortalRole } from "@/lib/portal-auth";
import { ProfilePageContent } from "@/components/features/profile/ProfilePageContent";

export const metadata: Metadata = { title: "My profile | Member" };

export default async function MemberProfilePage() {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  return <ProfilePageContent profile={profile} />;
}
