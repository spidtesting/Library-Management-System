import { requirePortalRole } from "@/lib/portal-auth";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requirePortalRole(["member", "librarian", "admin"]);
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
