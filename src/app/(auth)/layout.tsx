import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-8 safe-area-x safe-area-bottom supports-[min-height:100dvh]:min-h-dvh md:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.04_247),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_247),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mb-8 flex items-center gap-2 text-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">Public Library</p>
          <p className="text-xs text-muted-foreground">Management system</p>
        </div>
      </div>
      {children}
    </div>
  );
}
