import type { Profile } from "@/types";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function PortalShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
