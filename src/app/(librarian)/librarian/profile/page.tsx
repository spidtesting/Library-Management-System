import type { Metadata } from "next";
import { requirePortalRole } from "@/lib/portal-auth";
import { ProfilePageContent } from "@/components/features/profile/ProfilePageContent";

export const metadata: Metadata = { title: "My profile | Librarian" };

export default async function LibrarianProfilePage() {
  const profile = await requirePortalRole(["librarian", "admin", "member"]);
  return <ProfilePageContent profile={profile} />;
}
