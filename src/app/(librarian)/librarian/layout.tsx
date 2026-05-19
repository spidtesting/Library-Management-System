import { requirePortalRole } from "@/lib/portal-auth";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requirePortalRole(["librarian", "admin"]);
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
