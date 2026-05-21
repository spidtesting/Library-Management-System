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
    <div className="flex min-h-dvh bg-muted/30 supports-[min-height:100dvh]:min-h-dvh">
      <Sidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-auto overscroll-y-contain">
          <div className="safe-area-x safe-area-bottom mx-auto w-full max-w-7xl py-4 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
