import type { Metadata } from "next";
import { requirePortalRole } from "@/lib/portal-auth";
import { ProfilePageContent } from "@/components/features/profile/ProfilePageContent";

export const metadata: Metadata = { title: "My profile | Admin" };

export default async function AdminProfilePage() {
  const profile = await requirePortalRole(["admin", "librarian", "member"]);
  return <ProfilePageContent profile={profile} />;
}
