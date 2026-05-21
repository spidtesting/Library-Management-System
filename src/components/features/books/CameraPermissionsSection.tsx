"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getCameraPermissionState,
  watchCameraPermission,
  type CoverPermissionState,
} from "@/lib/cover-image";
import { cn } from "@/lib/utils";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";

export function CameraPermissionsSection({
  className,
  defaultOpen = true,
}: {
  className?: string;
  /** On small screens, start expanded so staff see permission guidance immediately. */
  defaultOpen?: boolean;
}) {
  const [permission, setPermission] = useState<CoverPermissionState>("prompt");
  const [expanded, setExpanded] = useState(defaultOpen);

  useEffect(() => {
    void getCameraPermissionState().then(setPermission);
    return watchCameraPermission(setPermission);
  }, []);

  async function refreshPermission() {
    const next = await getCameraPermissionState();
    setPermission(next);
    toast.message(
      next === "granted"
        ? "Camera access is allowed"
        : next === "denied"
          ? "Camera is still blocked"
          : "Camera will ask when you take a photo"
    );
  }

  const rows: { label: string; detail: string; status: CoverPermissionState }[] = [
    {
      label: "Photo library / files",
      detail: "Pick an image from your device. No extra permission needed.",
      status: "granted",
    },
    {
      label: "Camera",
      detail:
        permission === "denied"
          ? "Blocked — enable camera for this site in browser settings, then tap Check again."
          : permission === "unsupported"
            ? "Live preview unavailable here. Use Take photo to open your device camera app."
            : permission === "granted"
              ? "Allowed — live camera preview is ready."
              : "Your browser will ask when you tap Take photo.",
      status: permission === "unsupported" ? "unsupported" : permission,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-lg border border-brand/20 bg-brand/[0.04] text-sm",
        className
      )}
    >
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center gap-2 text-left font-medium text-brand"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Camera & photo permissions
          <span className="ml-auto text-xs font-normal text-muted-foreground sm:hidden">
            {expanded ? "Hide" : "Show"}
          </span>
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-full gap-2 sm:h-9 sm:w-auto"
          onClick={() => void refreshPermission()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Check again
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-brand/10 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.label} className="flex gap-3">
                <PermissionBadge state={row.status} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{row.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{row.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          {permission === "denied" && (
            <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/[0.08] p-3 text-xs text-muted-foreground">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                How to allow camera on mobile & tablet
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1.5">
                <li>
                  <strong>iPhone/iPad (Safari):</strong> Settings → Safari → Camera → Allow, or
                  tap <strong>aA</strong> in the address bar → Website Settings → Camera.
                </li>
                <li>
                  <strong>Android (Chrome):</strong> Tap the lock icon → Permissions → Camera →
                  Allow. You may need to reload the page.
                </li>
                <li>
                  <strong>Tablet:</strong> Same steps as your browser on that device. Use Upload if
                  the camera still fails.
                </li>
                <li>
                  <strong>Desktop:</strong> Click the camera icon in the address bar and allow
                  access for this site.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PermissionBadge({ state }: { state: CoverPermissionState }) {
  const styles: Record<CoverPermissionState, string> = {
    granted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    denied: "bg-destructive/15 text-destructive",
    prompt: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    unsupported: "bg-muted text-muted-foreground",
  };
  const labels: Record<CoverPermissionState, string> = {
    granted: "Allowed",
    denied: "Blocked",
    prompt: "Ask",
    unsupported: "Fallback",
  };
  return (
    <span
      className={cn(
        "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[state]
      )}
    >
      {labels[state]}
    </span>
  );
}

export function useCameraPermission() {
  const [permission, setPermission] = useState<CoverPermissionState>("prompt");

  useEffect(() => {
    void getCameraPermissionState().then(setPermission);
    return watchCameraPermission(setPermission);
  }, []);

  return permission;
}
