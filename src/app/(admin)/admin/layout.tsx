import { requirePortalRole } from "@/lib/portal-auth";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requirePortalRole(["admin"]);
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
